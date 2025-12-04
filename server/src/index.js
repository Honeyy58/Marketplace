import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { createServer } from 'http'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import authRouter from './routes/auth.js'
import usersRouter from './routes/users.js'
import listingsRouter from './routes/listings.js'
import chatsRouter from './routes/chats.js'
import adminRouter from './routes/admin.js'
import { authSocket } from './middleware/auth.js'
import Message from './models/Message.js'
import Chat from './models/Chat.js'

dotenv.config()

const app = express()
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json({ limit: '5mb' }))
app.use(morgan('dev'))

app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/listings', listingsRouter)
app.use('/api/chats', chatsRouter)
app.use('/api/admin', adminRouter)

const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: process.env.CLIENT_URL, credentials: true } })

io.use(authSocket)

io.on('connection', socket => {
  socket.join(`user:${socket.user._id}`)
  socket.on('chat:join', chatId => {
    socket.join(`chat:${chatId}`)
  })
  socket.on('message:send', async payload => {
    const { chatId, to, text } = payload
    if (!text || !to) return
    let chat = await Chat.findById(chatId)
    if (!chat) {
      chat = await Chat.create({ participants: [socket.user._id, to] })
    }
    const msg = await Message.create({ chat: chat._id, sender: socket.user._id, receiver: to, text })
    io.to(`chat:${chat._id}`).emit('message:new', { _id: msg._id, chat: chat._id, sender: msg.sender, receiver: msg.receiver, text: msg.text, createdAt: msg.createdAt })
    io.to(`user:${to}`).emit('chat:notify', { chatId: chat._id })
  })
})

const PORT = process.env.PORT || 5000

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    httpServer.listen(PORT, () => {})
  })
  .catch(() => {
    process.exit(1)
  })

export default app
