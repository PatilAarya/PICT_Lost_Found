// Limits how often one computer (IP address) can call the API, to slow down spam
// and guessing. Built on express-rate-limit. app.js applies apiLimiter to all of
// /api; modules can import strictLimiter for sensitive routes such as login.
import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

// Build the standard "too many requests" error body.
function tooMany(message) {
  return { error: { code: 'TOO_MANY_REQUESTS', message } };
}

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.isTest,
  message: tooMany('Too many requests. Wait a few minutes and try again.'),
});

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.isTest,
  message: tooMany('Too many attempts. Wait 15 minutes and try again.'),
});
