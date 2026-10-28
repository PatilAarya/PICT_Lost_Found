// Creates and checks the 6-digit handover code.
import crypto from 'node:crypto';
import { config } from '../../../shared/config/index.js';

export function generateCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}

export function hashCode(code) {
  return crypto.createHmac('sha256', config.jwtSecret).update(String(code)).digest('hex');
}

export function codeMatches(code, storedHash) {
  if (!storedHash || !/^\d{6}$/.test(String(code))) {
    return false;
  }
  const typed = Buffer.from(hashCode(code), 'hex');
  const stored = Buffer.from(storedHash, 'hex');
  return typed.length === stored.length && crypto.timingSafeEqual(typed, stored);
}

export function codeExpiry(now = new Date()) {
  return new Date(now.getTime() + config.handoverCodeHours * 60 * 60 * 1000);
}
