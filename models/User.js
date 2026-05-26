import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  // ==========================================
  // ⚡ CREDIT SYSTEM FIELDS
  // ==========================================
  credits: { 
    type: Number, 
    default: 5 // Gives new users 5 free credits instantly
  },
  lastCreditReset: { 
    type: Date, 
    default: Date.now // Starts the 24-hour clock the moment they sign up
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);