import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from '../models/User.js'
import Listing from '../models/Listing.js'
import Chat from '../models/Chat.js'
import Message from '../models/Message.js'

dotenv.config()

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  await Promise.all([User.deleteMany({}), Listing.deleteMany({}), Chat.deleteMany({}), Message.deleteMany({})])
  const users = await User.insertMany([
    { name: 'Rahul Kumar', email: 'rahul@example.com', password: 'Pass@123', phone: '9876543210', pincode: '110001', city: 'Delhi', role: 'seller' },
    { name: 'Priya Singh', email: 'priya@example.com', password: 'Pass@123', phone: '9876501234', pincode: '560001', city: 'Bengaluru', role: 'buyer' },
    { name: 'Amit Shah', email: 'amit@example.com', password: 'Pass@123', phone: '9988776655', pincode: '400001', city: 'Mumbai', role: 'seller' },
    { name: 'Admin', email: 'admin@example.com', password: 'Admin@123', phone: '9000000000', pincode: '500001', city: 'Hyderabad', role: 'admin' }
  ])
  const listings = await Listing.insertMany([
    { title: 'Scooter for sale', description: 'Good condition', price: 25000, category: 'Vehicles', condition: 'Used', address: 'Connaught Place', pincode: '110001', city: 'Delhi', images: [], owner: users[0]._id, approved: true },
    { title: 'Math tuition', description: 'Class 8-10', price: 500, category: 'Services', condition: 'New', address: 'MG Road', pincode: '560001', city: 'Bengaluru', images: [], owner: users[2]._id, approved: true }
  ])
  const chat = await Chat.create({ participants: [users[1]._id, users[0]._id], listing: listings[0]._id })
  await Message.insertMany([
    { chat: chat._id, sender: users[1]._id, receiver: users[0]._id, text: 'Is it available?' },
    { chat: chat._id, sender: users[0]._id, receiver: users[1]._id, text: 'Yes, available.' }
  ])
  await mongoose.disconnect()
}

run()
