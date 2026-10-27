// One counter per serial type (L = lost, F = found, C = claim).
// utils/serial.js increases a counter with one atomic database update, so two
// people posting at the same moment can never get the same serial number.
import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.model('Counter', counterSchema);
