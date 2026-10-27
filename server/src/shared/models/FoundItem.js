// An item someone found and posted. Owned by Member 3 (found module).
// Fields follow docs/CONTRACT.md section C. hiddenDetails.answer has select: false,
// so normal queries never load it; only handler routes may ask for it with
// .select('+hiddenDetails.answer'). That keeps the owner-check answers secret.
import mongoose from 'mongoose';
import { CATEGORIES, COLORS, FOUND_STATUS } from '../constants.js';
import { locationSchema } from './locationSchema.js';

const imageSchema = new mongoose.Schema(
  { publicUrl: String, privateId: String, order: { type: Number, default: 0 } },
  { _id: false }
);

const hiddenDetailSchema = new mongoose.Schema(
  {
    promptKey: { type: String, required: true },
    promptText: { type: String, required: true },
    answer: { type: String, select: false },
  },
  { _id: false }
);

const foundItemSchema = new mongoose.Schema(
  {
    serial: { type: String, required: true, unique: true },
    finderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, enum: CATEGORIES, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    colors: [{ type: String, enum: COLORS }],
    brand: { type: String, default: '' },
    images: [imageSchema],
    location: { type: locationSchema },
    foundAt: { type: Date },
    custody: {
      type: { type: String, enum: ['desk', 'finder'], default: 'finder' },
      deskId: { type: String },
    },
    hiddenDetails: [hiddenDetailSchema],
    aiSuggestion: {
      category: String,
      colors: [String],
      confidence: Number,
    },
    status: { type: String, enum: FOUND_STATUS, default: 'posted' },
    expiresAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const FoundItem = mongoose.model('FoundItem', foundItemSchema);
