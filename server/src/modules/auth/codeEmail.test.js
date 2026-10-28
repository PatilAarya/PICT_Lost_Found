// Tests for the login code email.
import { describe, expect, it } from 'vitest';
import { buildCodeEmail, spacedCode } from './codeEmail.js';
import { checkEmailDomain } from './loginCodes.js';
import { config } from '../../shared/config/index.js';

describe('login code email', () => {
  it('puts the code in the subject, the text and the HTML', () => {
    const email = buildCodeEmail('042117', 10);
    expect(email.subject).toContain('042117');
    expect(email.text).toContain('042117');
    expect(email.text).toContain('10 minutes');
    expect(email.html).toContain('042 117');
  });

  it('splits the code into two groups of three', () => {
    expect(spacedCode('123456')).toBe('123 456');
  });
});

describe('college email domains', () => {
  it('accepts ms.pict.edu and pict.edu, and refuses others when the rule is on', () => {
    const saved = config.allowAnyEmail;
    config.allowAnyEmail = false;
    try {
      expect(() => checkEmailDomain('vedant.pawar@ms.pict.edu')).not.toThrow();
      expect(() => checkEmailDomain('staff.member@pict.edu')).not.toThrow();
      expect(() => checkEmailDomain('someone@gmail.com')).toThrow(/college email/);
    } finally {
      config.allowAnyEmail = saved;
    }
  });
});
