import express from 'express'
import multer from 'multer'
import { auth } from '../middleware/auth.js'
import Listing from '../models/Listing.js'
import { uploadBuffer } from '../utils/cloudinary.js'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.get('/', async (req, res) => {
  const { city, pincode, category, q, minPrice, maxPrice } = req.query
  const filter = {}
  if (city) filter.city = city
  if (pincode) filter.pincode = pincode
  if (category) filter.category = category
  if (q) filter.title = { $regex: q, $options: 'i' }
  if (minPrice || maxPrice) filter.price = {}
  if (minPrice) filter.price.$gte = Number(minPrice)
  if (maxPrice) filter.price.$lte = Number(maxPrice)
  filter.status = 'active'
  filter.approved = true
  const items = await Listing.find(filter).sort({ createdAt: -1 }).populate('owner', 'name city pincode')
  res.json(items)
})

router.get('/mine', auth, async (req, res) => {
  const items = await Listing.find({ owner: req.user._id }).sort({ createdAt: -1 })
  res.json(items)
})

router.get('/:id', async (req, res) => {
  const item = await Listing.findById(req.params.id).populate('owner', 'name city pincode')
  if (!item) return res.status(404).json({ error: 'not_found' })
  item.views += 1
  await item.save()
  res.json(item)
})

router.post('/', auth, upload.array('images', 5), async (req, res) => {
  const { title, description, price, category, condition, address, pincode, city } = req.body
  const images = []
  for (const f of req.files || []) {
    const url = await uploadBuffer(f.buffer)
    images.push(url)
  }
  const item = await Listing.create({ title, description, price, category, condition, address, pincode, city, images, owner: req.user._id })
  res.status(201).json(item)
})

router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  const item = await Listing.findById(req.params.id)
  if (!item) return res.status(404).json({ error: 'not_found' })
  if (String(item.owner) !== String(req.user._id)) return res.status(403).json({ error: 'forbidden' })
  const updates = req.body
  if (req.files?.length) {
    const images = []
    for (const f of req.files) {
      const url = await uploadBuffer(f.buffer)
      images.push(url)
    }
    updates.images = images
  }
  const updated = await Listing.findByIdAndUpdate(req.params.id, updates, { new: true })
  res.json(updated)
})

router.delete('/:id', auth, async (req, res) => {
  const item = await Listing.findById(req.params.id)
  if (!item) return res.status(404).json({ error: 'not_found' })
  if (String(item.owner) !== String(req.user._id)) return res.status(403).json({ error: 'forbidden' })
  await item.deleteOne()
  res.json({ ok: true })
})

router.put('/:id/status', auth, async (req, res) => {
  const item = await Listing.findById(req.params.id)
  if (!item) return res.status(404).json({ error: 'not_found' })
  if (String(item.owner) !== String(req.user._id)) return res.status(403).json({ error: 'forbidden' })
  item.status = req.body.status
  await item.save()
  res.json(item)
})

export default router
