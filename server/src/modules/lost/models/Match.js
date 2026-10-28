// Model for a match between a lost report and a found item.
import mongoose from 'mongoose';

const factorSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    points: { type: Number, required: true },
    max: { type: Number, required: true },
    detail: { type: String, default: '' },
  },
  { _id: false }
);

const matchSchema = new mongoose.Schema(
  {
    lostReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'LostReport', required: true },
    foundItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem', required: true },
    total: { type: Number, required: true },
    breakdown: [factorSchema],
    seen: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

matchSchema.index({ lostReportId: 1, foundItemId: 1 }, { unique: true });

export const Match = mongoose.model('Match', matchSchema);
