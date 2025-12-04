import mongoose from 'mongoose'

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    images: [{ type: String }],
    price: { type: Number, required: true },
    category: { type: String, required: true },
    condition: { type: String },
    address: { type: String },
    pincode: { type: String },
    city: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    views: { type: Number, default: 0 },
    approved: { type: Boolean, default: false }
  },
  { timestamps: true }
)

export default mongoose.model('Listing', listingSchema)
