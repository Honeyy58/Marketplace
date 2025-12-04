import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' })

export const fetchChats = createAsyncThunk('chat/fetchChats', async (_, { getState }) => {
  const token = getState().auth.token
  const { data } = await api.get('/chats', { headers: { Authorization: `Bearer ${token}` } })
  return data
})

export const fetchMessages = createAsyncThunk('chat/fetchMessages', async (chatId, { getState }) => {
  const token = getState().auth.token
  const { data } = await api.get(`/chats/${chatId}/messages`, { headers: { Authorization: `Bearer ${token}` } })
  return { chatId, messages: data }
})

const slice = createSlice({
  name: 'chat',
  initialState: { chats: [], messagesByChat: {}, loading: false },
  reducers: {
    addMessageLocal: (s, a) => {
      const { chatId, message } = a.payload
      s.messagesByChat[chatId] = [...(s.messagesByChat[chatId] || []), message]
    }
  },
  extraReducers: (b) => {
    b.addCase(fetchChats.pending, (s) => { s.loading = true })
    b.addCase(fetchChats.fulfilled, (s, a) => { s.loading = false; s.chats = a.payload })
    b.addCase(fetchChats.rejected, (s) => { s.loading = false })
    b.addCase(fetchMessages.fulfilled, (s, a) => { s.messagesByChat[a.payload.chatId] = a.payload.messages })
  }
})

export const { addMessageLocal } = slice.actions
export default slice.reducer
