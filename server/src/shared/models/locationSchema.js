// The Location shape used everywhere (docs/CONTRACT.md section B):
// { buildingId, floorId, areaId, x, y }. x and y are optional 0..1 positions on the
// floor plan image. LostReport and FoundItem embed this schema.
import mongoose from 'mongoose';

export const locationSchema = new mongoose.Schema(
  {
    buildingId: { type: String, required: true },
    floorId: { type: String, required: true },
    areaId: { type: String },
    x: { type: Number, min: 0, max: 1 },
    y: { type: Number, min: 0, max: 1 },
  },
  // _id: false because a location is part of its parent document, not a record of its own.
  { _id: false }
);
