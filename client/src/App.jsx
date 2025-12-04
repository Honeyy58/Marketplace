import React, { useEffect } from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import { fetchFeed } from './store/slices/listingsSlice.js'
import { login, register, logout } from './store/slices/authSlice.js'
import { fetchChats, fetchMessages, addMessageLocal } from './store/slices/chatSlice.js'

let socket

const Protected = ({ children, role }) => {
  const { token, user } = useSelector(s => s.auth)
  if (!token) return <Navigate to="/login" />
  if (role && user?.role !== role) return <Navigate to="/" />
  return children
}

const Navbar = () => {
  const { user } = useSelector(s => s.auth)
  const dispatch = useDispatch()
  return (
    <div className="flex items-center justify-between p-3 border-b">
      <Link to="/" className="font-semibold">LCM</Link>
      <div className="flex gap-3">
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            {user.role === 'admin' && <Link to="/admin">Admin</Link>}
            <button onClick={() => dispatch(logout())}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </div>
  )
}

const Login = () => {
  const dispatch = useDispatch()
  const onSubmit = e => {
    e.preventDefault()
    const form = Object.fromEntries(new FormData(e.target))
    dispatch(login(form))
  }
  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto p-4 flex flex-col gap-2">
      <input name="email" placeholder="Email" className="border p-2" />
      <input name="password" type="password" placeholder="Password" className="border p-2" />
      <button className="bg-blue-600 text-white p-2">Login</button>
    </form>
  )
}

const Register = () => {
  const dispatch = useDispatch()
  const onSubmit = e => {
    e.preventDefault()
    const form = Object.fromEntries(new FormData(e.target))
    dispatch(register(form))
  }
  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto p-4 flex flex-col gap-2">
      <input name="name" placeholder="Name" className="border p-2" />
      <input name="email" placeholder="Email" className="border p-2" />
      <input name="password" type="password" placeholder="Password" className="border p-2" />
      <input name="phone" placeholder="Phone" className="border p-2" />
      <input name="pincode" placeholder="Pincode" className="border p-2" />
      <input name="city" placeholder="City" className="border p-2" />
      <select name="role" className="border p-2">
        <option value="buyer">Buyer</option>
        <option value="seller">Seller</option>
      </select>
      <button className="bg-green-600 text-white p-2">Register</button>
    </form>
  )
}

const Feed = () => {
  const dispatch = useDispatch()
  const { feed, loading } = useSelector(s => s.listings)
  useEffect(() => { dispatch(fetchFeed()) }, [dispatch])
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      {loading && <div>Loading...</div>}
      {feed.map(i => (
        <div key={i._id} className="border p-3">
          <div className="font-semibold">{i.title}</div>
          <div className="text-sm">₹{i.price} • {i.city}</div>
          <Link to={`/listing/${i._id}`} className="text-blue-600">View</Link>
        </div>
      ))}
    </div>
  )
}

const Dashboard = () => {
  const dispatch = useDispatch()
  const { token } = useSelector(s => s.auth)
  useEffect(() => { dispatch(fetchChats()) }, [dispatch])
  useEffect(() => {
    if (token) {
      socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', { auth: { token } })
      socket.on('message:new', m => dispatch(addMessageLocal({ chatId: m.chat, message: m })))
    }
    return () => { socket && socket.disconnect() }
  }, [token, dispatch])
  const chats = useSelector(s => s.chat.chats)
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="border p-3">
        <div className="font-semibold mb-2">Chats</div>
        {chats.map(c => (
          <ChatItem key={c._id} chat={c} />
        ))}
      </div>
    </div>
  )
}

const ChatItem = ({ chat }) => {
  const dispatch = useDispatch()
  const messages = useSelector(s => s.chat.messagesByChat[chat._id]) || []
  useEffect(() => {
    dispatch(fetchMessages(chat._id))
  }, [dispatch, chat._id])
  useEffect(() => { socket && socket.emit('chat:join', chat._id) }, [chat._id])
  const { user } = useSelector(s => s.auth)
  const onSend = e => {
    e.preventDefault()
    const text = e.target.text.value
    const to = chat.participants.find(p => p._id !== user._id)?._id || chat.participants.find(p => p !== user._id)
    socket.emit('message:send', { chatId: chat._id, to, text })
    e.target.reset()
  }
  return (
    <div className="border p-2 mb-3">
      <div className="text-sm">{chat.participants.map(p => p.name || p).join(', ')}</div>
      <div className="h-40 overflow-auto border my-2 p-2 flex flex-col gap-1">
        {messages.map(m => (
          <div key={m._id} className={m.sender === user._id ? 'text-right' : ''}>{m.text}</div>
        ))}
      </div>
      <form onSubmit={onSend} className="flex gap-2">
        <input name="text" className="border p-2 flex-1" placeholder="Type a message" />
        <button className="bg-blue-600 text-white px-3">Send</button>
      </form>
    </div>
  )
}

const Admin = () => {
  return <div className="p-4">Admin</div>
}

export default function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/admin" element={<Protected role="admin"><Admin /></Protected>} />
      </Routes>
    </div>
  )
}
