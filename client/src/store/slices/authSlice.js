import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' })

const tokenKey = 'lcm_token'

export const register = createAsyncThunk('auth/register', async (payload) => {
  const { data } = await api.post('/auth/register', payload)
  return data
})

export const login = createAsyncThunk('auth/login', async (payload) => {
  const { data } = await api.post('/auth/login', payload)
  return data
})

const slice = createSlice({
  name: 'auth',
  initialState: { user: null, token: localStorage.getItem(tokenKey) || null, loading: false, error: null },
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      localStorage.removeItem(tokenKey)
    },
    setToken: (state, action) => {
      state.token = action.payload
      localStorage.setItem(tokenKey, action.payload)
    }
  },
  extraReducers: (b) => {
    b.addCase(register.pending, (s) => { s.loading = true })
    b.addCase(register.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.user; s.token = a.payload.token; localStorage.setItem(tokenKey, a.payload.token) })
    b.addCase(register.rejected, (s) => { s.loading = false; s.error = 'error' })
    b.addCase(login.pending, (s) => { s.loading = true })
    b.addCase(login.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.user; s.token = a.payload.token; localStorage.setItem(tokenKey, a.payload.token) })
    b.addCase(login.rejected, (s) => { s.loading = false; s.error = 'error' })
  }
})

export const { logout, setToken } = slice.actions
export default slice.reducer
