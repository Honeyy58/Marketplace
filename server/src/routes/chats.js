import express from 'express'
import { auth } from '../middleware/auth.js'
import Chat from '../models/Chat.js'
import Message from '../models/Message.js'

const router = express.Router()

router.get('/', auth, async (req, res) => {
  const chats = await Chat.find({ participants: req.user._id }).sort({ updatedAt: -1 }).populate('participants', 'name city')
  res.json(chats)
})

router.post('/', auth, async (req, res) => {
  const { withUserId, listingId } = req.body
  let chat = await Chat.findOne({ participants: { $all: [req.user._id, withUserId] }, listing: listingId || null })
  if (!chat) chat = await Chat.create({ participants: [req.user._id, withUserId], listing: listingId || null })
  res.status(201).json(chat)
})

router.get('/:id/messages', auth, async (req, res) => {
  const chat = await Chat.findById(req.params.id)
  if (!chat) return res.status(404).json({ error: 'not_found' })
  if (!chat.participants.map(String).includes(String(req.user._id))) return res.status(403).json({ error: 'forbidden' })
  const messages = await Message.find({ chat: chat._id }).sort({ createdAt: 1 })
  res.json(messages)
})

export default router
