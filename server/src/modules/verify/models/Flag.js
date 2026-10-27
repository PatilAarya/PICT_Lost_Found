// A warning sign about an account, raised automatically by services/flagRules.js
// (for example many failed owner checks). An admin reviews it on /verify/flags and
// dismisses it, warns the user, or suspends the account.
import mongoose from 'mongoose';

export const FLAG_STATUS = ['open', 'dismissed', 'warned', 'suspended'];

const flagSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    details: { type: String, default: '' },
    status: { type: String, enum: FLAG_STATUS, default: 'open' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Flag = mongoose.model('Flag', flagSchema);
