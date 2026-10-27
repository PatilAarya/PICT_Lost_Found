// Starting a claim. Checks the item can be claimed, reuses the claimant's existing
// claim for the same item (so the 3-try limit cannot be dodged by starting again),
// and otherwise creates a new Claim with a PICT-C serial. Used by claimRoutes.js.
import mongoose from 'mongoose';
import { Claim } from '../../../shared/models/Claim.js';
import { FoundItem } from '../../../shared/models/FoundItem.js';
import { HttpError } from '../../../shared/utils/httpError.js';
import { nextSerial } from '../../../shared/utils/serial.js';
import { findOr404, sameId } from './access.js';
import { checkFlags } from './flagRules.js';

export const CLAIMABLE_STATUS = ['posted', 'in_custody', 'claim_pending', 'transferred_admin'];

// Throw unless this user may claim this item.
function checkCanClaim(item, user) {
  if (!CLAIMABLE_STATUS.includes(item.status)) {
    throw new HttpError(409, 'NOT_CLAIMABLE', 'This item can no longer be claimed.');
  }
  if (sameId(item.finderId, user._id)) {
    throw new HttpError(409, 'OWN_ITEM', 'You posted this item, so you cannot claim it.');
  }
  if (!item.hiddenDetails || item.hiddenDetails.length === 0) {
    throw new HttpError(409, 'NO_QUESTIONS', 'This item has no owner questions. Ask at the desk.');
  }
}

// Return the user's claim for this item, creating it if needed.
export async function startClaim(user, foundItemId, lostReportId) {
  const item = await findOr404(FoundItem, foundItemId, 'Item');
  checkCanClaim(item, user);

  const existing = await Claim.findOne({ foundItemId: item._id, claimantId: user._id });
  if (existing && ['rejected', 'released', 'cancelled'].includes(existing.status)) {
    throw new HttpError(
      409,
      'CLAIM_CLOSED',
      'Your claim for this item is closed. Ask at the desk.'
    );
  }
  if (existing) {
    return { claim: existing, item };
  }

  const claim = await Claim.create({
    serial: await nextSerial('claim'),
    foundItemId: item._id,
    claimantId: user._id,
    lostReportId: mongoose.isValidObjectId(lostReportId) ? lostReportId : undefined,
  });
  await checkFlags(user._id);
  return { claim, item };
}
