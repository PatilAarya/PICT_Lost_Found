// The 3-try rule. After MAX_CLAIM_ATTEMPTS wrong answers the claimant is locked out
// of that item: LOCKOUT_MINUTES (30) the first time, 24 hours from the second time.
// Pure functions that change a claim object; answerService.js saves it.
import { config } from '../../../shared/config/index.js';

const LONG_LOCK_MS = 24 * 60 * 60 * 1000;

// How long the next lockout lasts, given how many lockouts this claim already had.
export function lockoutDurationMs(previousLockouts) {
  return previousLockouts >= 1 ? LONG_LOCK_MS : config.lockoutMinutes * 60 * 1000;
}

// If a lockout has ended, give the claimant a fresh set of attempts.
export function unlockIfExpired(claim, now = new Date()) {
  if (claim.status === 'locked' && claim.lockedUntil && claim.lockedUntil <= now) {
    claim.status = 'answering';
    claim.attemptsUsed = 0;
    claim.lockedUntil = undefined;
  }
}

// Count one wrong answer. Returns { startedLockout, lockedUntil, attemptsLeft }.
export function recordFailure(claim, now = new Date()) {
  claim.attemptsUsed += 1;
  const attemptsLeft = Math.max(0, config.maxClaimAttempts - claim.attemptsUsed);
  if (attemptsLeft > 0) {
    return { startedLockout: false, lockedUntil: null, attemptsLeft };
  }
  const lockedUntil = new Date(now.getTime() + lockoutDurationMs(claim.lockoutCount));
  claim.lockoutCount += 1;
  claim.status = 'locked';
  claim.lockedUntil = lockedUntil;
  return { startedLockout: true, lockedUntil, attemptsLeft: 0 };
}

// Attempts still available on a claim (0 while locked).
export function attemptsLeft(claim) {
  if (claim.status === 'locked') {
    return 0;
  }
  return Math.max(0, config.maxClaimAttempts - claim.attemptsUsed);
}
