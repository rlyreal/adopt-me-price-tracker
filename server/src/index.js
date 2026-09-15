import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { authRouter } from './routes/auth.js'
import { petsRouter } from './routes/pets.js'

const app = express()
const port = process.env.PORT || 4000

app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || true }))
app.use(express.json({ limit: '2mb' }))
app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/login', authRouter)
app.use('/api/pets', petsRouter)
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Something went wrong on the server' })
})

if (process.env.VERCEL !== '1') {
  app.listen(port, () => console.log(`Petfolio API listening on port ${port}`))
}

export default app
