// The 3-try rule and lockout times.
import { config } from '../../../shared/config/index.js';

const LONG_LOCK_MS = 24 * 60 * 60 * 1000;

export function lockoutDurationMs(previousLockouts) {
  return previousLockouts >= 1 ? LONG_LOCK_MS : config.lockoutMinutes * 60 * 1000;
}

export function unlockIfExpired(claim, now = new Date()) {
  if (claim.status === 'locked' && claim.lockedUntil && claim.lockedUntil <= now) {
    claim.status = 'answering';
    claim.attemptsUsed = 0;
    claim.lockedUntil = undefined;
  }
}

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

export function attemptsLeft(claim) {
  if (claim.status === 'locked') {
    return 0;
  }
  return Math.max(0, config.maxClaimAttempts - claim.attemptsUsed);
}
