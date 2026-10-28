// Model for a one-time login code (only its hash is stored).
import mongoose from 'mongoose';

const loginCodeSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    wrongTries: { type: Number, default: 0 },
    used: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const LoginCode = mongoose.model('LoginCode', loginCodeSchema);
