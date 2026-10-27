// The 6-digit one-time handover code the owner shows at the desk.
// We store an HMAC-SHA256 of the code (keyed with JWT_SECRET), never the code
// itself, and compare with timingSafeEqual so the comparison time leaks nothing.
import crypto from 'node:crypto';
import { config } from '../../../shared/config/index.js';

// A random code from 000000 to 999999 (randomInt is cryptographically secure).
export function generateCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}

// HMAC = a hash mixed with a secret key, so nobody without the key can rebuild it.
export function hashCode(code) {
  return crypto.createHmac('sha256', config.jwtSecret).update(String(code)).digest('hex');
}

// True when the typed code produces the stored hash.
export function codeMatches(code, storedHash) {
  if (!storedHash || !/^\d{6}$/.test(String(code))) {
    return false;
  }
  const typed = Buffer.from(hashCode(code), 'hex');
  const stored = Buffer.from(storedHash, 'hex');
  return typed.length === stored.length && crypto.timingSafeEqual(typed, stored);
}

// When a code made now stops working.
export function codeExpiry(now = new Date()) {
  return new Date(now.getTime() + config.handoverCodeHours * 60 * 60 * 1000);
}
