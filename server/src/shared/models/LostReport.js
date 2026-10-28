// Model for a lost item report.
import mongoose from 'mongoose';
import { CATEGORIES, COLORS, LOST_STATUS } from '../constants.js';
import { locationSchema } from './locationSchema.js';

const lostReportSchema = new mongoose.Schema(
  {
    serial: { type: String, required: true, unique: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, enum: CATEGORIES, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    colors: [{ type: String, enum: COLORS }],
    brand: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    lastSeen: { type: locationSchema },
    lostFrom: { type: Date },
    lostTo: { type: Date },
    status: { type: String, enum: LOST_STATUS, default: 'open' },
    savedItemId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const LostReport = mongoose.model('LostReport', lostReportSchema);
