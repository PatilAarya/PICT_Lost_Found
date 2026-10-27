// A request by someone who says a found item is theirs. Owned by Member 2 (verify module).
// Fields follow docs/CONTRACT.md section C. The handover code is stored only as a hash
// (select: false), so even a database leak does not reveal the 6-digit code.
import mongoose from 'mongoose';
import { CLAIM_STATUS } from '../constants.js';

const answerSchema = new mongoose.Schema(
  { promptKey: { type: String, required: true }, text: { type: String, default: '' } },
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
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Claim = mongoose.model('Claim', claimSchema);
