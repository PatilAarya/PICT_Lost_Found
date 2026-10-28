// The location shape used by lost reports and found items.
import mongoose from 'mongoose';

export const locationSchema = new mongoose.Schema(
  {
    buildingId: { type: String, required: true },
    floorId: { type: String, required: true },
    areaId: { type: String },
    x: { type: Number, min: 0, max: 1 },
    y: { type: Number, min: 0, max: 1 },
  },
  { _id: false }
);
