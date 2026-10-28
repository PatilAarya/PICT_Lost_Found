// Model for a found item.
import mongoose from 'mongoose';
import { CATEGORIES, COLORS, FOUND_STATUS } from '../constants.js';
import { locationSchema } from './locationSchema.js';

const imageSchema = new mongoose.Schema(
  {
    publicUrl: String,
    privateId: { type: String, select: false },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const hiddenDetailSchema = new mongoose.Schema(
  {
    promptKey: { type: String, required: true },
    promptText: { type: String, required: true },
    answer: { type: String, required: true, select: false, trim: true },
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

foundItemSchema.index({ finderId: 1, status: 1 });
foundItemSchema.index({ 'location.buildingId': 1, 'location.floorId': 1 });

export const FoundItem = mongoose.model('FoundItem', foundItemSchema);
