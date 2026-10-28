// Reads all settings from the .env file.
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

if (!process.env.VITEST) {
  const rootEnvFile = fileURLToPath(new URL('../../../../.env', import.meta.url));
  dotenv.config({ path: rootEnvFile, quiet: true });
}

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

export function isDevSwitcherOn() {
  return config.nodeEnv === 'development' && config.devAuth;
}
