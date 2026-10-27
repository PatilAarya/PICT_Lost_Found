// One 6-digit login code sent to an email address.
// We store only a hash of the code (never the code itself), when it expires,
// how many wrong tries were made, and whether it has been used.
// loginCodes.js creates and checks these documents.
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
