import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }
  },
  { timestamps: true }
)

export default mongoose.model('Chat', chatSchema)
