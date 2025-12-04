import express from 'express'
import { auth } from '../middleware/auth.js'
import User from '../models/User.js'

const router = express.Router()

router.get('/me', auth, async (req, res) => {
  const u = req.user
  res.json({ _id: u._id, name: u.name, email: u.email, role: u.role, phone: u.phone, pincode: u.pincode, city: u.city })
})

router.put('/me', auth, async (req, res) => {
  const { name, phone, pincode, city, role } = req.body
  const u = await User.findByIdAndUpdate(req.user._id, { name, phone, pincode, city, role }, { new: true })
  res.json({ _id: u._id, name: u.name, email: u.email, role: u.role, phone: u.phone, pincode: u.pincode, city: u.city })
})

export default router
