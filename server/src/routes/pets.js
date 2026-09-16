import { Router } from 'express'
import crypto from 'node:crypto'
import multer from 'multer'
import { supabase } from '../lib/supabase.js'

const router = Router()
const allowedRarities = ['common', 'uncommon', 'rare', 'ultra_rare', 'legendary']
const allowedCurrencies = ['PHP', 'USD']
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
  if (!name) return 'Name is required'
  if (!Number.isFinite(price) || price <= 0) return 'Price must be a positive number'
  if (!allowedRarities.includes(body.rarity)) return 'Choose a valid rarity'
  if (!allowedCurrencies.includes(body.currency)) return 'Choose a valid currency'
  return null
}

function petFields(body) {
  return {
    name: String(body.name).trim(),
    rarity: body.rarity,
    is_neon: body.is_neon === 'true' || body.is_neon === true,
    is_mega_neon: body.is_mega_neon === 'true' || body.is_mega_neon === true,
    is_flyable: body.is_flyable === 'true' || body.is_flyable === true,
    is_rideable: body.is_rideable === 'true' || body.is_rideable === true,
    price: Number(body.price),
    currency: body.currency,
    notes: String(body.notes || '').trim() || null
  }
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
    image = await uploadImage(req.file)
    const { data, error } = await supabase.from('pets').insert({ ...petFields(req.body), image_url: image?.url || null, image_path: image?.path || null }).select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (error) { if (image?.path) await removeImage(image.path); next(error) }
})

router.put('/:id', upload.single('image'), async (req, res, next) => {
  let image = null
  try {
    const validationError = validatePet(req.body)
    if (validationError) return res.status(400).json({ error: validationError })
    const { data: existing, error: fetchError } = await supabase.from('pets').select('*').eq('id', req.params.id).single()
    if (fetchError?.code === 'PGRST116') return res.status(404).json({ error: 'Pet not found' })
    if (fetchError) throw fetchError
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
