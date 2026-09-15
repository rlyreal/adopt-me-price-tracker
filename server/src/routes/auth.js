import { Router } from 'express'
import jwt from 'jsonwebtoken'

export const authRouter = Router()

function safeCompare(value, expected) {
  if (!value || !expected || value.length !== expected.length) return false
  let result = 0
  for (let index = 0; index < value.length; index += 1) result |= value.charCodeAt(index) ^ expected.charCodeAt(index)
  return result === 0
}

authRouter.post('/', (req, res) => {
  const { password } = req.body || {}
  if (!safeCompare(password, process.env.ADMIN_PASSWORD)) return res.status(401).json({ error: 'Incorrect password' })

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
})
