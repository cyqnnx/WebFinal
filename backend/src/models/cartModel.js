import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    guestId: { type: String, required: false },

    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CartItem', default: [] }],
  },
  { timestamps: true }
);

// Ensure we keep a single cart per identity.
cartSchema.index({ userId: 1 }, { unique: true, sparse: true });
cartSchema.index({ guestId: 1 }, { unique: true, sparse: true });

export default mongoose.model('Cart', cartSchema);

