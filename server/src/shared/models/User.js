// Model for a user of the app.
import mongoose from 'mongoose';
import { ROLES } from '../constants.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ROLES, default: 'student' },
    department: { type: String, default: '' },
    year: { type: String, default: '' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    flagged: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const User = mongoose.model('User', userSchema);
