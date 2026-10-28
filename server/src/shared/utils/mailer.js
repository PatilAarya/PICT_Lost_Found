// Sends emails, or prints them when email is not set up.
import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

export function isRealEmailOn() {
  return Boolean(config.smtp.host) && !config.isTest;
}

function createTransport() {
  if (!isRealEmailOn()) {
    return nodemailer.createTransport({ jsonTransport: true });
  }
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });
}

const transport = createTransport();

if (!config.isTest) {
  const mode = isRealEmailOn()
    ? `sending real emails through ${config.smtp.host}`
    : 'SMTP_HOST is empty, so emails are printed here instead of sent';
  console.log(`[mail] ${mode}`);
}

export async function sendMail({ to, subject, text, html }) {
  await transport.sendMail({ from: config.smtp.from, to, subject, text, html });
  if (!isRealEmailOn() && !config.isTest) {
    console.log(`[mail] to ${to}: ${subject}\n${text}`);
  }
}
