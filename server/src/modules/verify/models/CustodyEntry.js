// One line in a found item's custody log ("who had it, when, what happened").
// Each entry stores the hash of the entry before it (prevHash) and its own hash, so
// the entries form a chain: editing any old entry breaks every hash after it.
// services/custodyChain.js writes and checks these entries.
import mongoose from 'mongoose';
import { CUSTODY_ACTIONS } from '../../../shared/constants.js';

const custodyEntrySchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem', required: true },
  seq: { type: Number, required: true },
  action: { type: String, enum: CUSTODY_ACTIONS, required: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  actorRole: { type: String, default: '' },
  note: { type: String, default: '' },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  ts: { type: Date, required: true },
  prevHash: { type: String, required: true },
  hash: { type: String, required: true },
});

// Unique itemId + seq: if two writes try to add entry number 5 at the same moment,
// MongoDB accepts one and rejects the other, which then retries as number 6.
custodyEntrySchema.index({ itemId: 1, seq: 1 }, { unique: true });

export const CustodyEntry = mongoose.model('CustodyEntry', custodyEntrySchema);
