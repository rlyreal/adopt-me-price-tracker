import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { supabase } from '../lib/supabase.js'

const router = Router()
const allowedRarities = ['common', 'uncommon', 'rare', 'ultra_rare', 'legendary']
const allowedCurrencies = ['PHP', 'USD']
const sortable = { name: 'name', priceAsc: 'price', priceDesc: 'price', updated: 'updated_at' }

router.use(requireAuth)

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

router.post('/', async (req, res, next) => {
  try {
    const validationError = validatePet(req.body)
    if (validationError) return res.status(400).json({ error: validationError })
    const { data, error } = await supabase.from('pets').insert({ ...petFields(req.body), image_url: null, image_path: null }).select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (error) { next(error) }
})

router.put('/:id', async (req, res, next) => {
  try {
    const validationError = validatePet(req.body)
    if (validationError) return res.status(400).json({ error: validationError })
    const { data: existing, error: fetchError } = await supabase.from('pets').select('*').eq('id', req.params.id).single()
    if (fetchError?.code === 'PGRST116') return res.status(404).json({ error: 'Pet not found' })
    if (fetchError) throw fetchError
    const updates = { ...petFields(req.body) }
    Object.assign(updates, { image_url: null, image_path: null })
    const { data, error } = await supabase.from('pets').update(updates).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json(data)
  } catch (error) { next(error) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const { data: existing, error: fetchError } = await supabase.from('pets').select('image_path').eq('id', req.params.id).single()
    if (fetchError?.code === 'PGRST116') return res.status(404).json({ error: 'Pet not found' })
    if (fetchError) throw fetchError
    const { error } = await supabase.from('pets').delete().eq('id', req.params.id)
    if (error) throw error
    res.status(204).end()
  } catch (error) { next(error) }
})

export { router as petsRouter }
