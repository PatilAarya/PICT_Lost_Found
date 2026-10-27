// Turns database documents into the safe JSON each person may see.
// publicItem() never includes hidden answers or private photo ids, and claimView()
// never includes the handover code or its hash. Routes always send these views.
import { attemptsLeft } from './lockout.js';

// The public face of a found item: blurred photos only, no hidden answers.
export function publicItem(item) {
  return {
    id: item._id,
    serial: item.serial,
    title: item.title,
    category: item.category,
    colors: item.colors,
    images: (item.images || []).map((image) => ({ publicUrl: image.publicUrl })),
    location: item.location,
    foundAt: item.foundAt,
    status: item.status,
    custodyType: item.custody ? item.custody.type : 'finder',
    deskId: item.custody ? item.custody.deskId : undefined,
  };
}

// Only the questions (promptKey and promptText), never the answers.
export function promptsOf(item) {
  return (item.hiddenDetails || []).map((detail) => ({
    promptKey: detail.promptKey,
    promptText: detail.promptText,
  }));
}

// The steps shown on the claim's Timeline, with a time when each step happened.
function timelineOf(claim) {
  const approvedOrLater = ['approved', 'released'].includes(claim.status);
  const waitingOrLater = approvedOrLater || ['awaiting_handler', 'rejected'].includes(claim.status);
  return [
    { label: 'Claim started', done: true, at: claim.createdAt },
    { label: 'Owner check passed', done: waitingOrLater },
    {
      label: claim.status === 'rejected' ? 'Rejected by desk' : 'Approved by desk',
      done: approvedOrLater || claim.status === 'rejected',
    },
    { label: 'Item collected', done: claim.status === 'released', at: claim.releasedAt },
  ];
}

// What a claimant (or staff, or the finder) sees about one claim.
export function claimView(claim, item, viewer) {
  const isApproved = claim.status === 'approved';
  const custodyType = item && item.custody ? item.custody.type : 'finder';
  return {
    id: claim._id,
    serial: claim.serial,
    status: claim.status,
    // Tells the page to show the finder's side of a finder-kept handover.
    viewerIsFinder: Boolean(item && viewer && String(item.finderId) === String(viewer._id)),
    createdAt: claim.createdAt,
    attemptsLeft: attemptsLeft(claim),
    lockedUntil: claim.lockedUntil || null,
    decisionNote: claim.decisionNote,
    prompts: ['answering', 'locked'].includes(claim.status) && item ? promptsOf(item) : [],
    item: item ? publicItem(item) : null,
    timeline: timelineOf(claim),
    handover: {
      custodyType,
      codeReady: isApproved && custodyType === 'desk' && !claim.handoverShownAt,
      codeShownAt: claim.handoverShownAt || null,
      expiresAt: claim.handoverExpiresAt || null,
      ownerConfirmedAt: claim.ownerConfirmedAt || null,
      finderConfirmedAt: claim.finderConfirmedAt || null,
    },
  };
}
