// Routes for posting and reading found items.
import express from 'express';
import { config } from '../../shared/config/index.js';
import { requireAuth } from '../../shared/middleware/requireAuth.js';
import { HttpError, readPagination } from '../../shared/utils/httpError.js';
import { nextSerial } from '../../shared/utils/serial.js';
import { services } from '../../shared/services/registry.js';
import { FoundItem } from '../../shared/models/FoundItem.js';
import { rankDesks, listDesks } from './desk-suggestion.js';
import { createItemSchema } from './itemSchema.js';
import imageRouter from './imageRoutes.js';

const router = express.Router();
const HOUR_MS = 60 * 60 * 1000;

router.use(imageRouter);

async function logPosting(item, actorId) {
  await services.appendCustody({ itemId: item._id, action: 'POSTED', actorId });
  if (item.custody.type === 'desk') {
    await services.appendCustody({
      itemId: item._id,
      action: 'DROPPED_AT_DESK',
      actorId,
      note: `Desk ${item.custody.deskId || ''}`.trim(),
    });
  }
}

router.post('/items', requireAuth, async (req, res) => {
  const data = createItemSchema.parse(req.body);
  const serial = await nextSerial('found');
  const expiresAt =
    data.custody.type === 'desk' ? new Date(Date.now() + config.holdHoursDesk * HOUR_MS) : null;

  const item = await FoundItem.create({ ...data, serial, finderId: req.user._id, expiresAt });

  await logPosting(item, req.user._id);
  await services.runMatching({ foundItemId: item._id });

  res.status(201).json({ item });
});

router.get('/items', requireAuth, async (req, res) => {
  const { page, limit, skip } = readPagination(req.query);
  const filter = {};

  const wantsAll = req.query.all === 'true' && ['handler', 'admin'].includes(req.user.role);
  if (!wantsAll) {
    filter.finderId = req.user._id;
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const [items, total] = await Promise.all([
    FoundItem.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    FoundItem.countDocuments(filter),
  ]);

  res.json({ items, page, limit, total });
});

router.get('/items/:id', requireAuth, async (req, res) => {
  const item = await FoundItem.findById(req.params.id);
  if (!item) {
    throw new HttpError(404, 'NOT_FOUND', 'This found item does not exist.');
  }
  res.json({ item });
});

router.get('/desks/suggest', requireAuth, (req, res) => {
  const { buildingId, floorId } = req.query;
  if (!buildingId || !floorId) {
    throw new HttpError(400, 'BAD_REQUEST', 'Pass buildingId and floorId to get a suggestion.');
  }
  const desks = rankDesks({ buildingId, floorId }).slice(0, 3);
  res.json({ desk: desks[0] || null, desks, allDesks: listDesks() });
});

router.get('/hidden-detail-prompts', requireAuth, (req, res) => {
  const prompts = services.getHiddenDetailPrompts(req.query.category);
  res.json({ prompts });
});

export default router;
