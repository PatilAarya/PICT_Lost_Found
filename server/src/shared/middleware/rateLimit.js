// Limits how often one computer can call the API.
import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

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
