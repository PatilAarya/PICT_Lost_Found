// A "saved item": something a student carries every day (their bottle, their ID card),
// described once so that reporting it lost later takes one tap. The report form copies
// these fields in. Owned by the lost module; only the owner can see their saved items.
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
    // Stickers or marks that make it recognisable, for example "NASA sticker on the lid".
    stickers: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const SavedItem = mongoose.model('SavedItem', savedItemSchema);
