// HTTP routes for login: request a code, verify it, who am I, log out, and the
// list of seeded users for the dev switcher. Mounted at /api/auth by index.js.
// The JWT is kept in an httpOnly cookie so page JavaScript can never read or steal it.
import express from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config, isDevSwitcherOn } from '../../shared/config/index.js';
import { User } from '../../shared/models/User.js';
import { TOKEN_COOKIE, requireAuth } from '../../shared/middleware/requireAuth.js';
import { strictLimiter } from '../../shared/middleware/rateLimit.js';
import { HttpError } from '../../shared/utils/httpError.js';
import { sendMail } from '../../shared/utils/mailer.js';
import { checkEmailDomain, checkLoginCode, createLoginCode } from './loginCodes.js';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const emailSchema = z.object({ email: z.email().toLowerCase() });
const verifySchema = z.object({
  email: z.email().toLowerCase(),
  code: z.string().regex(/^\d{6}$/),
});

const router = express.Router();

// Turn "aarav.sharma@pict.edu" into "Aarav Sharma" for a first-time user's name.
function nameFromEmail(email) {
  const words = email.split('@')[0].split(/[._-]+/);
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Put a signed 7-day login token in an httpOnly cookie.
function setLoginCookie(res, userId) {
  const token = jwt.sign({ userId: String(userId) }, config.jwtSecret, { expiresIn: '7d' });
  res.cookie(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.nodeEnv === 'production',
    maxAge: SEVEN_DAYS_MS,
  });
}

router.post('/request-code', strictLimiter, async (req, res) => {
  const { email } = emailSchema.parse(req.body);
  checkEmailDomain(email);
  const code = await createLoginCode(email);
  await sendMail({
    to: email,
    subject: `Your PICT Lost and Found code: ${code}`,
    text: `Your login code is ${code}. It works for 10 minutes.`,
  });
  // Tests cannot open an inbox, so only in test mode the code is returned in the response.
  res.json(config.isTest ? { ok: true, devCode: code } : { ok: true });
});

router.post('/verify-code', strictLimiter, async (req, res) => {
  const { email, code } = verifySchema.parse(req.body);
  await checkLoginCode(email, code);
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email, name: nameFromEmail(email), role: 'student' });
  }
  if (user.status === 'suspended') {
    throw new HttpError(403, 'SUSPENDED', 'This account is suspended. Contact the admin office.');
  }
  setLoginCookie(res, user._id);
  res.json({ user });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.post('/logout', (_req, res) => {
  res.clearCookie(TOKEN_COOKIE);
  res.json({ ok: true });
});

router.get('/dev-users', async (_req, res) => {
  if (!isDevSwitcherOn()) {
    throw new HttpError(404, 'NOT_FOUND', 'The dev user switcher is turned off.');
  }
  const users = await User.find().sort({ role: 1, name: 1 }).select('name email role');
  res.json({ users });
});

export default router;
