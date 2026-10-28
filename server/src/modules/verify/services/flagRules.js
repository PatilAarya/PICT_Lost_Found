// Rules that flag spam or abuse.
import { Claim } from '../../../shared/models/Claim.js';
import { User } from '../../../shared/models/User.js';
import { ClaimAttempt } from '../models/ClaimAttempt.js';
import { Flag } from '../models/Flag.js';

const HOUR_MS = 60 * 60 * 1000;

function hoursAgo(hours, now) {
  return new Date(now.getTime() - hours * HOUR_MS);
}

export async function findFlagReasons(userId, now = new Date()) {
  const lastDay = hoursAgo(24, now);
  const lastWeek = hoursAgo(24 * 7, now);
  const claims = await Claim.countDocuments({ claimantId: userId, createdAt: { $gte: lastDay } });
  const failures = await ClaimAttempt.countDocuments({
    claimantId: userId,
    passed: false,
    createdAt: { $gte: lastWeek },
  });
  const lockouts = await ClaimAttempt.countDocuments({
    claimantId: userId,
    startedLockout: true,
    createdAt: { $gte: lastWeek },
  });

  const reasons = [];
  if (claims > 5) {
    reasons.push({ reason: 'many_claims', details: `${claims} claims in 24 hours` });
  }
  if (failures >= 3) {
    reasons.push({ reason: 'failed_checks', details: `${failures} failed owner checks in 7 days` });
  }
  if (lockouts >= 2) {
    reasons.push({ reason: 'lockouts', details: `${lockouts} lockouts in 7 days` });
  }
  return reasons;
}

export async function checkFlags(userId) {
  const reasons = await findFlagReasons(userId);
  for (const { reason, details } of reasons) {
    const alreadyOpen = await Flag.exists({ userId, reason, status: 'open' });
    if (!alreadyOpen) {
      await Flag.create({ userId, reason, details });
      await User.updateOne({ _id: userId }, { $set: { flagged: true } });
    }
  }
}
