// A request by someone who says a found item is theirs. Owned by Member 2 (verify module).
// Fields follow docs/CONTRACT.md section C, plus verify-only fields at the end.
// The handover code is stored as an HMAC hash; the plain code is kept (hidden) only
// until the claimant has seen it once, then deleted.
import mongoose from 'mongoose';
import { CLAIM_STATUS } from '../constants.js';

const answerSchema = new mongoose.Schema(
  { promptKey: { type: String, required: true }, text: { type: String, default: '' } },
  { _id: false }
);

const scoreSchema = new mongoose.Schema(
  { promptKey: { type: String, required: true }, score: { type: Number, default: 0 } },
  { _id: false }
);

const claimSchema = new mongoose.Schema(
  {
    serial: { type: String, required: true, unique: true },
    foundItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem', required: true },
    claimantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lostReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'LostReport' },
    status: { type: String, enum: CLAIM_STATUS, default: 'answering' },
    score: { type: Number, default: 0 },
    answers: [answerSchema],
    attemptsUsed: { type: Number, default: 0 },
    lockedUntil: { type: Date },
    handoverCodeHash: { type: String, select: false },
    handoverExpiresAt: { type: Date },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    decisionNote: { type: String, default: '' },

    // Verify-only fields (added by Member 2).
    scores: [scoreSchema],
    lockoutCount: { type: Number, default: 0 },
    itemStatusBefore: { type: String },
    handoverCodePlain: { type: String, select: false },
    handoverShownAt: { type: Date },
    handoverUsedAt: { type: Date },
    ownerConfirmedAt: { type: Date },
    finderConfirmedAt: { type: Date },
    releasedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Claim = mongoose.model('Claim', claimSchema);
