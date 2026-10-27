// Handover routes.
// GET  /claims/:id/code    the claimant sees the 6-digit code ONCE, then it is deleted
// POST /handover           a handler releases a desk item with the code (ID checked)
// POST /handover/confirm   owner or finder confirms a finder-kept handover
import express from 'express';
import { z } from 'zod';
import { requireRole } from '../../../shared/middleware/requireRole.js';
import { Claim } from '../../../shared/models/Claim.js';
import { FoundItem } from '../../../shared/models/FoundItem.js';
import { HttpError } from '../../../shared/utils/httpError.js';
import { STAFF_ROLES, findOr404, sameId } from '../services/access.js';
import { confirmHandover, releaseWithCode } from '../services/releaseService.js';
import { claimView } from '../services/views.js';

const router = express.Router();
const releaseSchema = z.object({
  claimId: z.string(),
  code: z.string(),
  // literal(true): the handler must tick "college ID checked" before releasing.
  idChecked: z.literal(true),
});
const confirmSchema = z.object({ claimId: z.string() });

router.get('/claims/:id/code', async (req, res) => {
  const claim = await findOr404(Claim, req.params.id, 'Claim', '+handoverCodePlain');
  if (!sameId(claim.claimantId, req.user._id)) {
    throw new HttpError(403, 'FORBIDDEN', 'Only the claimant can see this code.');
  }
  if (claim.status !== 'approved' || !claim.handoverExpiresAt) {
    throw new HttpError(409, 'NO_CODE', 'There is no handover code for this claim.');
  }
  if (claim.handoverShownAt || !claim.handoverCodePlain) {
    throw new HttpError(410, 'CODE_SHOWN', 'Your code was already shown once. Ask at the desk.');
  }
  const code = claim.handoverCodePlain;
  claim.handoverShownAt = new Date();
  claim.handoverCodePlain = undefined;
  await claim.save();
  res.json({ code, expiresAt: claim.handoverExpiresAt });
});

router.post('/handover', requireRole(...STAFF_ROLES), async (req, res) => {
  const { claimId, code } = releaseSchema.parse(req.body);
  const claim = await findOr404(Claim, claimId, 'Claim', '+handoverCodeHash');
  await releaseWithCode(claim, req.user, code);
  res.json({ ok: true });
});

router.post('/handover/confirm', async (req, res) => {
  const { claimId } = confirmSchema.parse(req.body);
  const claim = await findOr404(Claim, claimId, 'Claim');
  await confirmHandover(claim, req.user);
  const item = await FoundItem.findById(claim.foundItemId);
  res.json({ claim: claimView(claim, item, req.user) });
});

export default router;
