// Routes for reading and checking custody logs.
import express from 'express';
import { requireRole } from '../../../shared/middleware/requireRole.js';
import { HttpError } from '../../../shared/utils/httpError.js';
import { FoundItem } from '../../../shared/models/FoundItem.js';
import { User } from '../../../shared/models/User.js';
import { CustodyEntry } from '../models/CustodyEntry.js';
import { checkChain } from '../services/custodyChain.js';
import { verifyAllChains } from '../services/integrity.js';
import { findOr404, isStaff, sameId } from '../services/access.js';

const router = express.Router();

router.get('/custody/verify', requireRole('admin'), async (_req, res) => {
  res.json(await verifyAllChains());
});

router.get('/custody/:itemId', async (req, res) => {
  const item = await findOr404(FoundItem, req.params.itemId, 'Item');
  if (!isStaff(req.user) && !sameId(item.finderId, req.user._id)) {
    throw new HttpError(403, 'FORBIDDEN', 'Only the desk and the finder can see this log.');
  }
  const entries = await CustodyEntry.find({ itemId: item._id }).sort({ seq: 1 }).lean();
  const checked = checkChain(entries);
  const actors = await User.find({ _id: { $in: entries.map((entry) => entry.actorId) } })
    .select('name')
    .lean();
  const nameById = new Map(actors.map((actor) => [String(actor._id), actor.name]));
  res.json({
    item: { id: item._id, serial: item.serial, title: item.title },
    entries: entries.map((entry, index) => ({
      seq: entry.seq,
      action: entry.action,
      actorName: nameById.get(String(entry.actorId)) || 'System',
      note: entry.note,
      ts: entry.ts,
      hash: entry.hash,
      prevHash: entry.prevHash,
      valid: checked[index].valid,
    })),
  });
});

export default router;
