import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    cartId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true, index: true },
    drinkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model('CartItem', cartItemSchema);

