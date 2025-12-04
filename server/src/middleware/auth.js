import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ error: 'unauthorized' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if (!user) return res.status(401).json({ error: 'unauthorized' })
    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'unauthorized' })
  }
}

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'forbidden' })
  next()
}

export const authSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if (!user) return next(new Error('unauthorized'))
    socket.user = user
    next()
  } catch {
    next(new Error('unauthorized'))
  }
}
