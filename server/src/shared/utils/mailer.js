// Sends emails with nodemailer (login codes now, notifications later).
// With SMTP settings in .env (for example a free Brevo or Gmail account) the email is
// really sent. With SMTP_HOST empty, nothing is sent and the email is printed in the
// server console instead, so a laptop without email settings can still log in.
import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

// True when real emails can go out: SMTP is set and we are not running tests.
export function isRealEmailOn() {
  return Boolean(config.smtp.host) && !config.isTest;
}

// Build the transport once: a real SMTP server, or a "print as JSON" fake.
function createTransport() {
  if (!isRealEmailOn()) {
    return nodemailer.createTransport({ jsonTransport: true });
  }
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    // Port 465 talks TLS from the first byte; 587 starts plain and upgrades (STARTTLS).
    secure: config.smtp.port === 465,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });
}

const transport = createTransport();

// Say once at start-up which mode we are in, so nobody wonders where the codes went.
if (!config.isTest) {
  const mode = isRealEmailOn()
    ? `sending real emails through ${config.smtp.host}`
    : 'SMTP_HOST is empty, so emails are printed here instead of sent';
  console.log(`[mail] ${mode}`);
}

// Send one email. `html` is optional; `text` is the plain version every inbox can show.
export async function sendMail({ to, subject, text, html }) {
  await transport.sendMail({ from: config.smtp.from, to, subject, text, html });
  if (!isRealEmailOn() && !config.isTest) {
    console.log(`[mail] to ${to}: ${subject}\n${text}`);
  }
}
