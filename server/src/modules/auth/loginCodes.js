// Rules for sending and checking login codes.
import crypto from 'node:crypto';
import { config } from '../../shared/config/index.js';
import { HttpError } from '../../shared/utils/httpError.js';
import { LoginCode } from './LoginCode.js';

export const CODE_MINUTES = 10;
const MAX_CODES_PER_HOUR = 5;
const MAX_WRONG_TRIES = 5;

export function hashCode(email, code) {
  return crypto.createHash('sha256').update(`${email}:${code}:${config.jwtSecret}`).digest('hex');
}

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

export async function createLoginCode(email) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await LoginCode.countDocuments({ email, createdAt: { $gte: oneHourAgo } });
  if (recentCount >= MAX_CODES_PER_HOUR) {
    throw new HttpError(429, 'TOO_MANY_CODES', 'Too many codes asked for. Try again in an hour.');
  }
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  await LoginCode.create({
    email,
    codeHash: hashCode(email, code),
    expiresAt: new Date(Date.now() + CODE_MINUTES * 60 * 1000),
  });
  return code;
}

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
