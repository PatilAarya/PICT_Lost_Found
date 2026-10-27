// One try at answering the owner-check questions. Every attempt is recorded, pass
// or fail, so the 3-try rule, the lockouts and the abuse flags (services/flagRules.js)
// can be counted from real history.
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
