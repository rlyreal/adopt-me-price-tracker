import { Router } from 'express'
import crypto from 'node:crypto'
import multer from 'multer'
import { supabase } from '../lib/supabase.js'

const router = Router()
const allowedRarities = ['common', 'uncommon', 'rare', 'ultra_rare', 'legendary']
const allowedCurrencies = ['PHP', 'USD']
const allowedItemTypes = ['pet', 'egg', 'potion']
const sortable = { name: 'name', priceAsc: 'price', priceDesc: 'price', updated: 'updated_at' }
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 }, fileFilter: (_req, file, callback) => callback(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) })

async function uploadImage(file) {
  if (!file) return null
  const extension = file.mimetype.split('/')[1].replace('jpeg', 'jpg')
  const path = `${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from('pet-images').upload(path, file.buffer, { contentType: file.mimetype, upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('pet-images').getPublicUrl(path)
  return { path, url: data.publicUrl }
}

async function removeImage(path) {
  if (path) await supabase.storage.from('pet-images').remove([path])
}

function validatePet(body) {
  const name = String(body.name || '').trim()
  const price = Number(body.price)
  const itemType = body.item_type || 'pet'
  if (!name) return 'Name is required'
  if (!Number.isFinite(price) || price <= 0) return 'Price must be a positive number'
  if (itemType !== 'potion' && !allowedRarities.includes(body.rarity)) return 'Choose a valid rarity'
  if (!allowedCurrencies.includes(body.currency)) return 'Choose a valid currency'
  if (!allowedItemTypes.includes(itemType)) return 'Choose a valid item type'
  if (itemType !== 'potion' && body.potion_type) return 'Potion type is only valid for potions'
  const isNeon = body.is_neon === 'true' || body.is_neon === true
  const isMegaNeon = body.is_mega_neon === 'true' || body.is_mega_neon === true
  if (isNeon && isMegaNeon) return 'Neon and Mega cannot be combined'
  return null
}

function petFields(body) {
  return {
    name: String(body.name).trim(),
    item_type: body.item_type || 'pet',
    potion_type: body.item_type === 'potion' && body.potion_type ? body.potion_type : null,
    rarity: body.item_type === 'potion' ? 'common' : body.rarity,
    is_neon: body.is_neon === 'true' || body.is_neon === true,
    is_mega_neon: body.is_mega_neon === 'true' || body.is_mega_neon === true,
    is_flyable: body.is_flyable === 'true' || body.is_flyable === true,
    is_rideable: body.is_rideable === 'true' || body.is_rideable === true,
    price: Number(body.price),
    currency: body.currency,
    notes: String(body.notes || '').trim() || null
  }
}

function petSignature(body) {
  const fields = petFields(body)
  return JSON.stringify([fields.name.toLowerCase(), fields.item_type, fields.potion_type, fields.rarity, fields.price, fields.currency, fields.is_neon, fields.is_mega_neon, fields.is_flyable, fields.is_rideable])
}

function duplicatePetError(pet, existingPets = [], excludeId) {
  const signature = petSignature(pet)
  return existingPets.some((existing) => existing.id !== excludeId && petSignature(existing) === signature)
    ? 'This exact pet listing already exists'
    : null
}

router.get('/', async (req, res, next) => {
  try {
    const { search = '', rarity = '', category = '', sort = 'updated' } = req.query
    let query = supabase.from('pets').select('*')
    if (search) query = query.ilike('name', `%${search}%`)
    if (rarity) query = query.eq('rarity', rarity)
    if (category === 'neon') query = query.eq('is_neon', true)
    if (category === 'mega') query = query.eq('is_mega_neon', true)
    if (category === 'fly') query = query.eq('is_flyable', true)
    if (category === 'ride') query = query.eq('is_rideable', true)
    if (category === 'fly_ride') query = query.eq('is_flyable', true).eq('is_rideable', true)
    const column = sortable[sort] || 'updated_at'
    query = query.order(column, { ascending: sort === 'name' || sort === 'priceAsc' })
    const { data, error } = await query
    if (error) throw error
    res.json(data)
  } catch (error) { next(error) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('pets').select('*').eq('id', req.params.id).single()
    if (error?.code === 'PGRST116') return res.status(404).json({ error: 'Pet not found' })
    if (error) throw error
    res.json(data)
  } catch (error) { next(error) }
})

router.post('/', upload.single('image'), async (req, res, next) => {
  let image = null
  try {
    const validationError = validatePet(req.body)
    if (validationError) return res.status(400).json({ error: validationError })
    const { data: existingPets, error: duplicateCheckError } = await supabase.from('pets').select('id, name, rarity, is_neon, is_mega_neon, is_flyable, is_rideable, price, currency').eq('name', String(req.body.name).trim())
    if (duplicateCheckError) throw duplicateCheckError
    const duplicateError = duplicatePetError(req.body, existingPets)
    if (duplicateError) return res.status(409).json({ error: duplicateError })
    image = await uploadImage(req.file)
    const { data, error } = await supabase.from('pets').insert({ ...petFields(req.body), image_url: image?.url || null, image_path: image?.path || null }).select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (error) { if (image?.path) await removeImage(image.path); next(error) }
})

router.post('/import', async (req, res, next) => {
  try {
    const pets = req.body?.pets
    if (!Array.isArray(pets) || !pets.length) return res.status(400).json({ error: 'Add at least one pet to import' })
    if (pets.length > 500) return res.status(400).json({ error: 'You can import up to 500 pets at a time' })
    const validationError = pets.map(validatePet).find(Boolean)
    if (validationError) return res.status(400).json({ error: validationError })
    const signatures = new Set()
    if (pets.some((pet) => {
      const signature = petSignature(pet)
      if (signatures.has(signature)) return true
      signatures.add(signature)
      return false
    })) return res.status(409).json({ error: 'The CSV contains duplicate pet listings' })
    const names = [...new Set(pets.map((pet) => String(pet.name).trim()))]
    const { data: existingPets, error: duplicateCheckError } = await supabase.from('pets').select('id, name, rarity, is_neon, is_mega_neon, is_flyable, is_rideable, price, currency').in('name', names)
    if (duplicateCheckError) throw duplicateCheckError
    if (pets.some((pet) => duplicatePetError(pet, existingPets))) return res.status(409).json({ error: 'One or more pet listings already exist' })
    const { error } = await supabase.from('pets').insert(pets.map(petFields))
    if (error) throw error
    res.status(201).json({ imported: pets.length })
  } catch (error) { next(error) }
})

router.put('/:id', upload.single('image'), async (req, res, next) => {
  let image = null
  try {
    const validationError = validatePet(req.body)
    if (validationError) return res.status(400).json({ error: validationError })
    const { data: existing, error: fetchError } = await supabase.from('pets').select('*').eq('id', req.params.id).single()
    if (fetchError?.code === 'PGRST116') return res.status(404).json({ error: 'Pet not found' })
    if (fetchError) throw fetchError
    const { data: matchingPets, error: duplicateCheckError } = await supabase.from('pets').select('id, name, rarity, is_neon, is_mega_neon, is_flyable, is_rideable, price, currency').eq('name', String(req.body.name).trim())
    if (duplicateCheckError) throw duplicateCheckError
    const duplicateError = duplicatePetError(req.body, matchingPets, req.params.id)
    if (duplicateError) return res.status(409).json({ error: duplicateError })
    image = await uploadImage(req.file)
    const updates = { ...petFields(req.body) }
    if (image) Object.assign(updates, { image_url: image.url, image_path: image.path })
    const { data, error } = await supabase.from('pets').update(updates).eq('id', req.params.id).select().single()
    if (error) throw error
    if (image && existing.image_path) await removeImage(existing.image_path)
    res.json(data)
  } catch (error) { if (image?.path) await removeImage(image.path); next(error) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const { data: existing, error: fetchError } = await supabase.from('pets').select('image_path').eq('id', req.params.id).single()
    if (fetchError?.code === 'PGRST116') return res.status(404).json({ error: 'Pet not found' })
    if (fetchError) throw fetchError
    const { error } = await supabase.from('pets').delete().eq('id', req.params.id)
    if (error) throw error
    await removeImage(existing.image_path)
    res.status(204).end()
  } catch (error) { next(error) }
})

export { router as petsRouter }
