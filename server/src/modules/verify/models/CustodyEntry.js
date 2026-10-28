// Model for one entry in an item's custody log.
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

custodyEntrySchema.index({ itemId: 1, seq: 1 }, { unique: true });

export const CustodyEntry = mongoose.model('CustodyEntry', custodyEntrySchema);
