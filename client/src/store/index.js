import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice.js'
import listingsReducer from './slices/listingsSlice.js'
import chatReducer from './slices/chatSlice.js'

export default configureStore({
  reducer: { auth: authReducer, listings: listingsReducer, chat: chatReducer }
})
