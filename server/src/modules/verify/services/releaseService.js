// Giving the item back. Two ways in: the handler types the owner's 6-digit code at
// the desk (releaseWithCode), or, for items the finder kept, both people confirm in
// the app (confirmHandover). Both end in finishRelease().
import { FoundItem } from '../../../shared/models/FoundItem.js';
import { LostReport } from '../../../shared/models/LostReport.js';
import { HttpError } from '../../../shared/utils/httpError.js';
import { appendCustody } from './custodyChain.js';
import { codeMatches } from './handoverCode.js';
import { notifyUser } from './notifyHelpers.js';
import { sameId } from './access.js';
import { writeAudit } from './audit.js';

// Mark claim, item and lost report as done, log RELEASED, thank the finder.
async function finishRelease(claim, item, actor, note) {
  claim.status = 'released';
  claim.releasedAt = new Date();
  await claim.save();
  await FoundItem.updateOne({ _id: item._id }, { $set: { status: 'released' } });
  if (claim.lostReportId) {
    await LostReport.updateOne({ _id: claim.lostReportId }, { $set: { status: 'recovered' } });
  }
  await appendCustody({
    itemId: item._id,
    action: 'RELEASED',
    actorId: actor._id,
    note,
    meta: { claimId: claim._id },
  });
  await notifyUser(
    item.finderId,
    'ITEM_STATUS',
    `${item.title} is back with its owner`,
    'Thank you for handing it in.',
    '/found'
  );
}

// Desk release: check the code is right, not expired and not used before.
export async function releaseWithCode(claim, handler, code) {
  if (claim.status !== 'approved' || claim.handoverUsedAt) {
    throw new HttpError(
      409,
      'CODE_USED',
      'This code has already been used or the claim is not approved.'
    );
  }
  if (!claim.handoverExpiresAt || claim.handoverExpiresAt < new Date()) {
    throw new HttpError(
      410,
      'CODE_EXPIRED',
      'This code has expired. Ask the owner to contact the desk.'
    );
  }
  if (!codeMatches(code, claim.handoverCodeHash)) {
    throw new HttpError(400, 'CODE_WRONG', "Wrong code. Check the digits on the owner's screen.");
  }
  claim.handoverUsedAt = new Date();
  // Single use: the stored hash is removed so the same code can never work again.
  claim.handoverCodeHash = undefined;
  const item = await FoundItem.findById(claim.foundItemId);
  await finishRelease(claim, item, handler, 'Code and college ID checked at the desk');
  await writeAudit(handler, 'ITEM_RELEASED', 'Claim', claim._id, 'Released with handover code');
}

// Finder-kept items: record this person's confirmation; release when both confirmed.
export async function confirmHandover(claim, user) {
  const item = await FoundItem.findById(claim.foundItemId);
  if (claim.status !== 'approved' || item.custody.type !== 'finder') {
    throw new HttpError(409, 'NOT_READY', 'This handover is not waiting for confirmation.');
  }
  if (sameId(claim.claimantId, user._id)) {
    claim.ownerConfirmedAt = claim.ownerConfirmedAt || new Date();
  } else if (sameId(item.finderId, user._id)) {
    claim.finderConfirmedAt = claim.finderConfirmedAt || new Date();
  } else {
    throw new HttpError(403, 'FORBIDDEN', 'Only the owner and the finder can confirm.');
  }
  await claim.save();
  if (claim.ownerConfirmedAt && claim.finderConfirmedAt) {
    await finishRelease(claim, item, user, 'Owner and finder both confirmed');
  }
  return claim;
}
