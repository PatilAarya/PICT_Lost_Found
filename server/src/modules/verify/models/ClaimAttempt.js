// Model for one try at answering the ownership questions.
import mongoose from 'mongoose';

const claimAttemptSchema = new mongoose.Schema(
  {
    claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', required: true },
    foundItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem', required: true },
    claimantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    passed: { type: Boolean, required: true },
    score: { type: Number, default: 0 },
    startedLockout: { type: Boolean, default: false },
    lockedUntil: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ClaimAttempt = mongoose.model('ClaimAttempt', claimAttemptSchema);
