// Model for a claim that a found item is someone's.
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
