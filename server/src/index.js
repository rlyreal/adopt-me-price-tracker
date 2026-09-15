import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import multer from 'multer'
import { authRouter } from './routes/auth.js'
import { petsRouter } from './routes/pets.js'

const app = express()
const port = process.env.PORT || 4000
const allowedOrigins = process.env.CLIENT_ORIGIN?.split(',').map((origin) => origin.trim().replace(/\/$/, '')).filter(Boolean) || []

app.use(cors({
  origin: (origin, callback) => {
    const isLocalDevelopment = process.env.VERCEL !== '1' && /^http:\/\/localhost:\d+$/.test(origin || '')
    if (!origin || isLocalDevelopment || allowedOrigins.includes(origin.replace(/\/$/, ''))) return callback(null, true)
    return callback(new Error('Origin is not allowed'))
  }
}))
app.use(express.json({ limit: '2mb' }))
app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/login', authRouter)
app.use('/api/pets', petsRouter)
app.use((err, _req, res, _next) => {
  console.error(err)
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5MB or smaller' : `Upload error: ${err.code}`
    return res.status(400).json({ error: message })
  }
  if (err.message === 'Unexpected field') return res.status(400).json({ error: 'The image upload field is invalid' })
  const message = process.env.NODE_ENV === 'production' ? 'Unable to save this pet. Check the server and Supabase configuration.' : err.message
  res.status(500).json({ error: message || 'Something went wrong on the server' })
})

if (process.env.VERCEL !== '1') {
  app.listen(port, () => console.log(`Petfolio API listening on port ${port}`))
}

export default app
