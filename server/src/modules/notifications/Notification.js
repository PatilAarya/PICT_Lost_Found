// One alert for one person, for example "Possible match for your bottle".
// type is one of NOTIFICATION_TYPES (shared/constants.js); link is the page to open;
// readAt stays empty until the person reads it, which is how "unread" is counted.
// Owned by the notifications module.
import mongoose from 'mongoose';
import { NOTIFICATION_TYPES } from '../../shared/constants.js';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    link: { type: String, default: '' },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    readAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Most screens ask for "my newest alerts" and "my unread count", so index on both.
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, readAt: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);
