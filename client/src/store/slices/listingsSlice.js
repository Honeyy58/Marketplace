import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' })

export const fetchFeed = createAsyncThunk('listings/fetchFeed', async (params = {}) => {
  const { data } = await api.get('/listings', { params })
  return data
})

const slice = createSlice({
  name: 'listings',
  initialState: { feed: [], loading: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchFeed.pending, (s) => { s.loading = true })
    b.addCase(fetchFeed.fulfilled, (s, a) => { s.loading = false; s.feed = a.payload })
    b.addCase(fetchFeed.rejected, (s) => { s.loading = false })
  }
})

export default slice.reducer
