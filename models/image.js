import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  userId: {
    type: String, // <-- THE FIX: Changed this from ObjectId to String
    required: true
  },
  url: {
    type: String,
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  style: {
    type: String,
    default: 'realistic'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Image', imageSchema);