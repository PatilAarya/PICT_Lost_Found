// Model for an everyday item a student saves once.
import mongoose from 'mongoose';
import { CATEGORIES, COLORS } from '../../../shared/constants.js';

const savedItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: { type: String, required: true, trim: true },
    category: { type: String, enum: CATEGORIES, required: true },
    colors: [{ type: String, enum: COLORS }],
    brand: { type: String, default: '' },
    description: { type: String, default: '' },
    stickers: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const SavedItem = mongoose.model('SavedItem', savedItemSchema);
