import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    address: { type: String },
    phone: { type: String },
    role: {
      type: String,
      enum: ['guest', 'employee', 'admin'],
      default: 'guest',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);

