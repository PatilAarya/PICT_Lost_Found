// Notification routes, mounted at /api/notifications. Everyone sees only their own.
//   GET   /               my alerts, newest first (?page&limit)
//   GET   /unread-count   how many I have not read yet (for the bell)
//   PATCH /:id/read       mark one as read
//   PATCH /read-all       mark all of mine as read
import express from 'express';
import { requireAuth } from '../../shared/middleware/requireAuth.js';
import { HttpError, readPagination } from '../../shared/utils/httpError.js';
import { Notification } from './Notification.js';

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { page, limit, skip } = readPagination(req.query);
  const filter = { userId: req.user._id };
  const [items, total, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...filter, readAt: null }),
  ]);
  res.json({ items, total, unread, page, limit });
});

router.get('/unread-count', async (req, res) => {
  const unread = await Notification.countDocuments({ userId: req.user._id, readAt: null });
  res.json({ unread });
});

// "read-all" is declared before "/:id/read" so it is never read as an id.
router.patch('/read-all', async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, readAt: null },
    { $set: { readAt: new Date() } }
  );
  res.json({ ok: true });
});

router.patch('/:id/read', async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).catch(() => null);
  if (!notification) {
    throw new HttpError(404, 'NOT_FOUND', 'This alert does not exist.');
  }
  if (!notification.readAt) {
    notification.readAt = new Date();
    await notification.save();
  }
  res.json({ notification });
});

export default router;
