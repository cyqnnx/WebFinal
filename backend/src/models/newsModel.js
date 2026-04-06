import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema(
  {
    untilDate: { type: Date, required: true, index: true },
    content: { type: String, required: true },
    link: { type: String, required: false, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('News', newsSchema);

