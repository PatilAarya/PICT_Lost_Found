// Sends emails with nodemailer (login codes now, notifications later).
// If SMTP_HOST is empty (normal on a laptop), nothing is really sent: the email is
// printed in the server console instead, so you can still log in during development.
import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

// Build the transport once: a real SMTP server, or a "print as JSON" fake.
function createTransport() {
  if (!config.smtp.host) {
    return nodemailer.createTransport({ jsonTransport: true });
  }
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });
}

const transport = createTransport();

// Send one plain-text email.
export async function sendMail({ to, subject, text }) {
  await transport.sendMail({ from: config.smtp.from, to, subject, text });
  if (!config.smtp.host && !config.isTest) {
    console.log(`[mail] to ${to}: ${subject}\n${text}`);
  }
}
