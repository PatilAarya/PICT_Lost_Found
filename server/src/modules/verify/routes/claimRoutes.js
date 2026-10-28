// Routes for starting a claim and answering questions.
import express from 'express';
import { z } from 'zod';
import { Claim } from '../../../shared/models/Claim.js';
import { FoundItem } from '../../../shared/models/FoundItem.js';
import { HttpError } from '../../../shared/utils/httpError.js';
import { findOr404, isStaff, sameId } from '../services/access.js';
import { startClaim } from '../services/claimService.js';
import { submitAnswers } from '../services/answerService.js';
import { unlockIfExpired } from '../services/lockout.js';
import { claimView, publicItem } from '../services/views.js';

const router = express.Router();
const startSchema = z.object({ foundItemId: z.string(), lostReportId: z.string().optional() });
const answerSchema = z.object({
  answers: z.array(z.object({ promptKey: z.string(), text: z.string().max(200) })).min(1),
});

router.get('/items/:foundItemId', async (req, res) => {
  const item = await findOr404(FoundItem, req.params.foundItemId, 'Item');
  res.json({ item: publicItem(item) });
});

router.post('/claims', async (req, res) => {
  const { foundItemId, lostReportId } = startSchema.parse(req.body);
  const { claim, item } = await startClaim(req.user, foundItemId, lostReportId);
  res.status(201).json({ claim: claimView(claim, item) });
});

router.get('/claims/mine', async (req, res) => {
  const claims = await Claim.find({ claimantId: req.user._id }).sort({ createdAt: -1 });
  const myItems = await FoundItem.find({ finderId: req.user._id, 'custody.type': 'finder' });
  const toConfirm = await Claim.find({
    foundItemId: { $in: myItems.map((item) => item._id) },
    status: 'approved',
  });
  const items = await FoundItem.find({
    _id: { $in: [...claims, ...toConfirm].map((claim) => claim.foundItemId) },
  });
  const itemById = new Map(items.map((item) => [String(item._id), item]));
  const view = (claim) => claimView(claim, itemById.get(String(claim.foundItemId)), req.user);
  res.json({ claims: claims.map(view), toConfirm: toConfirm.map(view) });
});

router.get('/claims/:id', async (req, res) => {
  const claim = await findOr404(Claim, req.params.id, 'Claim');
  const item = await FoundItem.findById(claim.foundItemId);
  const allowed =
    isStaff(req.user) ||
    sameId(claim.claimantId, req.user._id) ||
    (item && sameId(item.finderId, req.user._id));
  if (!allowed) {
    throw new HttpError(403, 'FORBIDDEN', 'This is not your claim.');
  }
  unlockIfExpired(claim);
  if (claim.isModified()) {
    await claim.save();
  }
  res.json({ claim: claimView(claim, item, req.user) });
});

router.post('/claims/:id/answer', async (req, res) => {
  const { answers } = answerSchema.parse(req.body);
  const claim = await findOr404(Claim, req.params.id, 'Claim');
  if (!sameId(claim.claimantId, req.user._id)) {
    throw new HttpError(403, 'FORBIDDEN', 'This is not your claim.');
  }
  res.json(await submitAnswers(claim, req.user, answers));
});

export default router;
