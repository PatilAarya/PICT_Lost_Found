// Checking a claimant's answers. Loads the secret answers (select '+hiddenDetails.answer'),
// scores them, then either moves the claim to the desk (pass) or counts a failure and
// maybe starts a lockout (fail). A failure never says which answer was wrong.
import { config } from '../../../shared/config/index.js';
import { FoundItem } from '../../../shared/models/FoundItem.js';
import { LostReport } from '../../../shared/models/LostReport.js';
import { HttpError } from '../../../shared/utils/httpError.js';
import { ClaimAttempt } from '../models/ClaimAttempt.js';
import { appendCustody } from './custodyChain.js';
import { checkFlags } from './flagRules.js';
import { recordFailure, unlockIfExpired } from './lockout.js';
import { notifyHandlers } from './notifyHelpers.js';
import { scoreAnswers } from './scoring.js';

// Save one attempt in the history (used by the abuse rules and analytics).
async function recordAttempt(claim, item, user, passed, score, lock) {
  await ClaimAttempt.create({
    claimId: claim._id,
    foundItemId: item._id,
    claimantId: user._id,
    passed,
    score,
    startedLockout: Boolean(lock.startedLockout),
    lockedUntil: lock.lockedUntil || undefined,
  });
}

// Pass: send the claim to the desk, mark the item and lost report, log it, tell handlers.
async function handlePass(claim, item, user) {
  claim.status = 'awaiting_handler';
  if (item.status !== 'claim_pending') {
    claim.itemStatusBefore = item.status;
    await FoundItem.updateOne({ _id: item._id }, { $set: { status: 'claim_pending' } });
  }
  if (claim.lostReportId) {
    await LostReport.updateOne(
      { _id: claim.lostReportId },
      { $set: { status: 'claim_in_progress' } }
    );
  }
  await claim.save();
  const actor = { itemId: item._id, actorId: user._id, meta: { claimId: claim._id } };
  await appendCustody({ ...actor, action: 'CLAIM_SUBMITTED', note: `Claim ${claim.serial}` });
  await appendCustody({ ...actor, action: 'VERIFICATION_PASSED', note: `Score ${claim.score}` });
  await notifyHandlers(
    'CLAIM_UPDATE',
    'Claim waiting for a decision',
    `${claim.serial} for ${item.title}`,
    '/verify/desk'
  );
  return { passed: true };
}

// Fail: count the try, maybe lock the claimant out, log it, check the abuse rules.
async function handleFail(claim, item, user, score) {
  const result = recordFailure(claim);
  await claim.save();
  await recordAttempt(claim, item, user, false, score, result);
  const actor = { itemId: item._id, actorId: user._id, meta: { claimId: claim._id } };
  await appendCustody({ ...actor, action: 'VERIFICATION_FAILED', note: `Score ${score}` });
  if (result.startedLockout) {
    await appendCustody({
      ...actor,
      action: 'LOCKED_OUT',
      note: `Until ${result.lockedUntil.toISOString()}`,
    });
  }
  await checkFlags(user._id);
  return { passed: false, attemptsLeft: result.attemptsLeft, lockedUntil: result.lockedUntil };
}

// Score the answers and apply the result. answers: [{ promptKey, text }].
export async function submitAnswers(claim, user, answers) {
  unlockIfExpired(claim);
  if (claim.status === 'locked') {
    const minutes = Math.ceil((claim.lockedUntil - Date.now()) / 60000);
    throw new HttpError(
      423,
      'LOCKED',
      `${config.maxClaimAttempts} wrong answers. Try again in ${minutes} minutes.`
    );
  }
  if (claim.status !== 'answering') {
    throw new HttpError(409, 'NOT_ANSWERING', 'This claim is not waiting for answers.');
  }
  const item = await FoundItem.findById(claim.foundItemId).select('+hiddenDetails.answer');
  const result = scoreAnswers(item.hiddenDetails, answers);
  claim.answers = answers;
  claim.score = result.average;
  claim.scores = result.scores;
  if (result.passed) {
    await recordAttempt(claim, item, user, true, result.average, {});
    return handlePass(claim, item, user);
  }
  return handleFail(claim, item, user, result.average);
}
