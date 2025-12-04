import express from 'express'
import { auth, adminOnly } from '../middleware/auth.js'
import User from '../models/User.js'
import Listing from '../models/Listing.js'
import Chat from '../models/Chat.js'
import Message from '../models/Message.js'

const router = express.Router()

router.get('/stats', auth, adminOnly, async (req, res) => {
  const users = await User.countDocuments()
  const listings = await Listing.countDocuments()
  const chats = await Chat.countDocuments()
  const messages = await Message.countDocuments()
  res.json({ users, listings, chats, messages })
})

router.get('/users', auth, adminOnly, async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 })
  res.json(users)
})

router.put('/users/:id/block', auth, adminOnly, async (req, res) => {
  const u = await User.findByIdAndUpdate(req.params.id, { blocked: req.body.blocked }, { new: true })
  res.json(u)
})

router.get('/listings', auth, adminOnly, async (req, res) => {
  const items = await Listing.find().sort({ createdAt: -1 }).populate('owner', 'name')
  res.json(items)
})

router.put('/listings/:id/approve', auth, adminOnly, async (req, res) => {
  const item = await Listing.findByIdAndUpdate(req.params.id, { approved: true }, { new: true })
  res.json(item)
})

router.put('/listings/:id/reject', auth, adminOnly, async (req, res) => {
  const item = await Listing.findByIdAndUpdate(req.params.id, { approved: false }, { new: true })
  res.json(item)
})

export default router
