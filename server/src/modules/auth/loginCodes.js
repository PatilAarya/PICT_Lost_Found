// The rules for one-time login codes: who may ask, how often, and how a code is checked.
// routes.js calls these functions; the LoginCode model stores the hashed codes.
// Rules: allowed email domain, max 5 codes per hour, 10-minute expiry, 5 wrong tries.
import crypto from 'node:crypto';
import { config } from '../../shared/config/index.js';
import { HttpError } from '../../shared/utils/httpError.js';
import { LoginCode } from './LoginCode.js';

const CODE_MINUTES = 10;
const MAX_CODES_PER_HOUR = 5;
const MAX_WRONG_TRIES = 5;

// Hash a code together with the email and secret, so a stolen database is useless.
export function hashCode(email, code) {
  return crypto.createHash('sha256').update(`${email}:${code}:${config.jwtSecret}`).digest('hex');
}

// Throw if this email is not from an allowed college domain (skipped in dev).
export function checkEmailDomain(email) {
  if (config.allowAnyEmail) {
    return;
  }
  const domain = email.split('@')[1];
  if (!config.allowedEmailDomains.includes(domain)) {
    const allowed = config.allowedEmailDomains.join(', ');
    throw new HttpError(400, 'EMAIL_NOT_ALLOWED', `Use your college email (${allowed}).`);
  }
}

// Make a new code for this email, save its hash, and return the plain code.
export async function createLoginCode(email) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await LoginCode.countDocuments({ email, createdAt: { $gte: oneHourAgo } });
  if (recentCount >= MAX_CODES_PER_HOUR) {
    throw new HttpError(429, 'TOO_MANY_CODES', 'Too many codes asked for. Try again in an hour.');
  }
  // randomInt is cryptographically random; padStart keeps codes like 004211 at 6 digits.
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  await LoginCode.create({
    email,
    codeHash: hashCode(email, code),
    expiresAt: new Date(Date.now() + CODE_MINUTES * 60 * 1000),
  });
  return code;
}

// Check a code typed by the user. Marks it used on success, throws on failure.
export async function checkLoginCode(email, code) {
  const record = await LoginCode.findOne({
    email,
    used: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record || record.wrongTries >= MAX_WRONG_TRIES) {
    throw new HttpError(400, 'CODE_EXPIRED', 'This code has expired. Ask for a new code.');
  }
  if (record.codeHash !== hashCode(email, code)) {
    record.wrongTries += 1;
    await record.save();
    throw new HttpError(
      400,
      'CODE_WRONG',
      'That code is not right. Check the email and try again.'
    );
  }
  record.used = true;
  await record.save();
}
