// The handler's final decision on a claim that passed the owner check.
// Approve: make a handover code (desk items) or ask both people to confirm (finder
// items), log APPROVED, tell the claimant. Reject: log REJECTED, tell the claimant,
// and give the item back its earlier status if nobody else is claiming it.
import { Claim } from '../../../shared/models/Claim.js';
import { FoundItem } from '../../../shared/models/FoundItem.js';
import { HttpError } from '../../../shared/utils/httpError.js';
import { appendCustody } from './custodyChain.js';
import { codeExpiry, generateCode, hashCode } from './handoverCode.js';
import { notifyUser } from './notifyHelpers.js';
import { writeAudit } from './audit.js';

// Approve the claim and prepare the handover.
export async function approveClaim(claim, item, handler, note) {
  claim.status = 'approved';
  claim.decidedBy = handler._id;
  claim.decisionNote = note;
  if (item.custody.type === 'desk') {
    const code = generateCode();
    claim.handoverCodeHash = hashCode(code);
    // Kept hidden (select: false) only until the claimant opens it once.
    claim.handoverCodePlain = code;
    claim.handoverExpiresAt = codeExpiry();
  }
  await claim.save();
  await FoundItem.updateOne({ _id: item._id }, { $set: { status: 'verified' } });
  await appendCustody({
    itemId: item._id,
    action: 'APPROVED',
    actorId: handler._id,
    note,
    meta: { claimId: claim._id },
  });
  await writeAudit(handler, 'CLAIM_APPROVED', 'Claim', claim._id, note);
  const body =
    item.custody.type === 'desk'
      ? 'Open the claim to see your handover code. Bring your college ID.'
      : 'Meet the finder, then both of you confirm in the app.';
  await notifyUser(
    claim.claimantId,
    'HANDOVER_READY',
    `Approved: ${item.title}`,
    body,
    `/verify/claim/${claim._id}`
  );
}

// Reject the claim and free the item if no other claim is in progress.
export async function rejectClaim(claim, item, handler, note) {
  claim.status = 'rejected';
  claim.decidedBy = handler._id;
  claim.decisionNote = note;
  await claim.save();
  const othersActive = await Claim.exists({
    foundItemId: item._id,
    _id: { $ne: claim._id },
    status: { $in: ['awaiting_handler', 'approved'] },
  });
  if (!othersActive) {
    await FoundItem.updateOne(
      { _id: item._id },
      { $set: { status: claim.itemStatusBefore || 'posted' } }
    );
  }
  await appendCustody({
    itemId: item._id,
    action: 'REJECTED',
    actorId: handler._id,
    note,
    meta: { claimId: claim._id },
  });
  await writeAudit(handler, 'CLAIM_REJECTED', 'Claim', claim._id, note);
  await notifyUser(
    claim.claimantId,
    'CLAIM_UPDATE',
    `Claim not approved: ${item.title}`,
    note || 'Ask at the desk for details.',
    `/verify/claim/${claim._id}`
  );
}

// Apply "approve" or "reject" to a claim that is waiting for the desk.
export async function decideClaim(claim, handler, decision, note) {
  if (claim.status !== 'awaiting_handler') {
    throw new HttpError(409, 'NOT_WAITING', 'This claim is not waiting for a decision.');
  }
  const item = await FoundItem.findById(claim.foundItemId);
  if (decision === 'approve') {
    await approveClaim(claim, item, handler, note);
  } else {
    await rejectClaim(claim, item, handler, note);
  }
}
