// Admin review of flagged accounts.
// GET   /flags       every flag, open ones first, with the user's name
// PATCH /flags/:id   { action: dismiss | warn | suspend }
// Warn notifies the user; suspend blocks the account (User.status = suspended).
import express from 'express';
import { z } from 'zod';
import { requireRole } from '../../../shared/middleware/requireRole.js';
import { User } from '../../../shared/models/User.js';
import { HttpError } from '../../../shared/utils/httpError.js';
import { Flag } from '../models/Flag.js';
import { findOr404 } from '../services/access.js';
import { notifyUser } from '../services/notifyHelpers.js';
import { writeAudit } from '../services/audit.js';

const router = express.Router();
const actionSchema = z.object({ action: z.enum(['dismiss', 'warn', 'suspend']) });
const NEW_STATUS = { dismiss: 'dismissed', warn: 'warned', suspend: 'suspended' };

// After a review, the user stays "flagged" only while another flag is still open.
async function refreshFlaggedMark(userId) {
  const stillOpen = await Flag.exists({ userId, status: 'open' });
  await User.updateOne({ _id: userId }, { $set: { flagged: Boolean(stillOpen) } });
}

router.get('/flags', requireRole('admin'), async (_req, res) => {
  const flags = await Flag.find().sort({ createdAt: -1 }).lean();
  const users = await User.find({ _id: { $in: flags.map((flag) => flag.userId) } }).select(
    'name email status'
  );
  const userById = new Map(users.map((user) => [String(user._id), user]));
  const ordered = [...flags].sort(
    (first, second) => (first.status === 'open' ? 0 : 1) - (second.status === 'open' ? 0 : 1)
  );
  res.json({
    flags: ordered.map((flag) => ({ ...flag, user: userById.get(String(flag.userId)) || null })),
  });
});

router.patch('/flags/:id', requireRole('admin'), async (req, res) => {
  const { action } = actionSchema.parse(req.body);
  const flag = await findOr404(Flag, req.params.id, 'Flag');
  if (flag.status !== 'open') {
    throw new HttpError(409, 'ALREADY_REVIEWED', 'This flag was already reviewed.');
  }
  flag.status = NEW_STATUS[action];
  flag.reviewedBy = req.user._id;
  await flag.save();
  if (action === 'warn') {
    await notifyUser(
      flag.userId,
      'ACCOUNT_FLAGGED',
      'Warning about your account',
      `${flag.details}. Repeated misuse can suspend your account.`,
      '/verify'
    );
  }
  if (action === 'suspend') {
    await User.updateOne({ _id: flag.userId }, { $set: { status: 'suspended' } });
  }
  await refreshFlaggedMark(flag.userId);
  await writeAudit(req.user, `FLAG_${flag.status.toUpperCase()}`, 'Flag', flag._id, flag.reason);
  res.json({ flag });
});

export default router;
