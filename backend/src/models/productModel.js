import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    // Official/admin store products
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    // Guest-submitted products
    guestId: { type: String, required: false },

    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, required: false, min: 0, max: 100, default: 0 },
    description: { type: String, required: false, default: '' },

    // Supabase storage object path/key
    thumbnail: { type: String, required: false },
    descriptionImages: { type: [String], required: false, default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);

