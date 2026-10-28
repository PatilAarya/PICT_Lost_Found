// Reads every setting from environment variables (the .env file) in one place.
// Other files import `config` instead of reading process.env directly, so a missing
// or misspelled variable is easy to find. See .env.example for the full list.
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// The .env file sits in the repo root, four folders up from this file. We point to it
// by path because `npm run dev -w server` runs with server/ as the working folder.
// Tests (Vitest sets VITEST) never read .env, so they can never send real emails.
if (!process.env.VITEST) {
  const rootEnvFile = fileURLToPath(new URL('../../../../.env', import.meta.url));
  dotenv.config({ path: rootEnvFile, quiet: true });
}

// Turn "a,b" into ['a', 'b'] and drop empty items.
function toList(value) {
  return (value || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length > 0);
}

const nodeEnv = process.env.NODE_ENV || 'development';

export const config = {
  nodeEnv,
  isDev: nodeEnv === 'development',
  isTest: nodeEnv === 'test',
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pict-lost-found',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'PICT Lost and Found <no-reply@pict.edu>',
  },
  allowedEmailDomains: toList(process.env.ALLOWED_EMAIL_DOMAINS || 'ms.pict.edu,pict.edu'),
  devAuth: process.env.DEV_AUTH === 'true',
  allowAnyEmail: process.env.ALLOW_ANY_EMAIL === 'true',
  holdHoursDesk: Number(process.env.HOLD_HOURS_DESK || 24),
  donateAfterDays: Number(process.env.DONATE_AFTER_DAYS || 30),
  handoverCodeHours: Number(process.env.HANDOVER_CODE_HOURS || 24),
  maxClaimAttempts: Number(process.env.MAX_CLAIM_ATTEMPTS || 3),
  lockoutMinutes: Number(process.env.LOCKOUT_MINUTES || 30),
};

// The dev user switcher only works on a developer's machine, never in production.
export function isDevSwitcherOn() {
  return config.nodeEnv === 'development' && config.devAuth;
}
