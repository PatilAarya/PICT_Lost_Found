// Routes for the security desk.
import express from 'express';
import { z } from 'zod';
import { requireRole } from '../../../shared/middleware/requireRole.js';
import { Claim } from '../../../shared/models/Claim.js';
import { FoundItem } from '../../../shared/models/FoundItem.js';
import { User } from '../../../shared/models/User.js';
import { HttpError } from '../../../shared/utils/httpError.js';
import { STAFF_ROLES, findOr404 } from '../services/access.js';
import { buildDeskQueue, buildReleaseList } from '../services/deskQueue.js';
import { decideClaim } from '../services/decisionService.js';
import { appendCustody } from '../services/custodyChain.js';
import { writeAudit } from '../services/audit.js';
import { publicItem } from '../services/views.js';

const router = express.Router();
const staffOnly = requireRole(...STAFF_ROLES);
const decisionSchema = z.object({
  decision: z.enum(['approve', 'reject']),
  note: z.string().max(300).default(''),
});

router.get('/desk/queue', staffOnly, async (_req, res) => {
  res.json({ claims: await buildDeskQueue() });
});

router.get('/desk/approved', staffOnly, async (_req, res) => {
  res.json({ claims: await buildReleaseList() });
});

router.patch('/claims/:id/decision', staffOnly, async (req, res) => {
  const { decision, note } = decisionSchema.parse(req.body);
  const claim = await findOr404(Claim, req.params.id, 'Claim');
  await decideClaim(claim, req.user, decision, note);
  res.json({ ok: true, status: claim.status });
});

router.get('/incoming', staffOnly, async (_req, res) => {
  const items = await FoundItem.find({ 'custody.type': 'desk', status: 'posted' }).sort({
    createdAt: 1,
  });
  const finders = await User.find({ _id: { $in: items.map((item) => item.finderId) } }).select(
    'name'
  );
  const nameById = new Map(finders.map((finder) => [String(finder._id), finder.name]));
  res.json({
    items: items.map((item) => ({
      ...publicItem(item),
      finderName: nameById.get(String(item.finderId)),
    })),
  });
});

router.patch('/incoming/:itemId/receive', staffOnly, async (req, res) => {
  const item = await findOr404(FoundItem, req.params.itemId, 'Item');
  if (item.custody.type !== 'desk' || item.status !== 'posted') {
    throw new HttpError(409, 'NOT_INCOMING', 'This item is not waiting to be received.');
  }
  const deskNote = `Desk ${item.custody.deskId || ''}`.trim();
  await appendCustody({
    itemId: item._id,
    action: 'RECEIVED_BY_HANDLER',
    actorId: req.user._id,
    note: deskNote,
  });
  await appendCustody({
    itemId: item._id,
    action: 'STORED',
    actorId: req.user._id,
    note: deskNote,
  });
  item.status = 'in_custody';
  await item.save();
  await writeAudit(req.user, 'ITEM_RECEIVED', 'FoundItem', item._id, deskNote);
  res.json({ item: publicItem(item) });
});

export default router;
