import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    status: { type: String, required: true, enum: ['paid', 'waiting', 'cancelled'], default: 'waiting' },
    drinkName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    discount: { type: Number, required: true, min: 0, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    notes: { type: String, default: '' },

    // TTL: auto-delete after 30 days.
    createdAt: { type: Date, default: Date.now, index: { expires: '30d' } },
  },
  { timestamps: false }
);

export default mongoose.model('Order', orderSchema);

