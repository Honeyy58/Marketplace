import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, pincode, city, role } = req.body
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ error: 'email_exists' })
    const user = await User.create({ name, email, password, phone, pincode, city, role })
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, pincode: user.pincode, city: user.city } })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ error: 'invalid_credentials' })
    const ok = await user.comparePassword(password)
    if (!ok) return res.status(400).json({ error: 'invalid_credentials' })
    if (user.blocked) return res.status(403).json({ error: 'blocked' })
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, pincode: user.pincode, city: user.city } })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
})

export default router
