// Tests for login: the full email-code flow, the role guard, the code rate limit,
// and the dev user switcher. Uses an in-memory MongoDB (shared/testing/testDb.js)
// and supertest, which sends HTTP requests to the app without opening a port.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { createApp } from '../../app.js';
import { config } from '../../shared/config/index.js';
import { requireAuth } from '../../shared/middleware/requireAuth.js';
import { requireRole } from '../../shared/middleware/requireRole.js';
import { errorHandler } from '../../shared/middleware/errorHandler.js';
import { User } from '../../shared/models/User.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../shared/testing/testDb.js';
import seedUsers from './seed.js';

let app;

// Log in through the real routes and return the cookie the server set.
async function loginAs(email) {
  const asked = await request(app).post('/api/auth/request-code').send({ email });
  const verified = await request(app)
    .post('/api/auth/verify-code')
    .send({ email, code: asked.body.devCode });
  return verified.headers['set-cookie'];
}

beforeAll(async () => {
  await startTestDb();
  app = (await createApp()).app;
});
beforeEach(clearTestDb);
afterAll(stopTestDb);

describe('email code login', () => {
  it('creates a student on first login and remembers them with a cookie', async () => {
    const cookie = await loginAs('new.student@pict.edu');
    expect(cookie[0]).toMatch(/token=.+HttpOnly/i);

    const me = await request(app).get('/api/auth/me').set('Cookie', cookie);
    expect(me.status).toBe(200);
    expect(me.body.user.role).toBe('student');
    expect(me.body.user.name).toBe('New Student');
  });

  it('rejects a wrong code and an unknown session', async () => {
    await request(app).post('/api/auth/request-code').send({ email: 'a@pict.edu' });
    const wrong = await request(app)
      .post('/api/auth/verify-code')
      .send({ email: 'a@pict.edu', code: '000000' });
    expect(wrong.status).toBe(400);

    const me = await request(app).get('/api/auth/me');
    expect(me.status).toBe(401);
    expect(me.body.error.code).toBe('NOT_LOGGED_IN');
  });

  it('allows only 5 codes per hour for one email', async () => {
    for (let i = 0; i < 5; i++) {
      const ok = await request(app).post('/api/auth/request-code').send({ email: 'b@pict.edu' });
      expect(ok.status).toBe(200);
    }
    const sixth = await request(app).post('/api/auth/request-code').send({ email: 'b@pict.edu' });
    expect(sixth.status).toBe(429);
  });
});

describe('role guard', () => {
  it('lets an admin in and keeps a student out', async () => {
    const guarded = express();
    guarded.use(cookieParser());
    guarded.get('/admin-only', requireAuth, requireRole('admin'), (_req, res) => res.json({}));
    guarded.use(errorHandler);

    await User.create({ name: 'Admin', email: 'boss@pict.edu', role: 'admin' });
    const adminCookie = await loginAs('boss@pict.edu');
    const studentCookie = await loginAs('kid@pict.edu');

    expect((await request(guarded).get('/admin-only').set('Cookie', adminCookie)).status).toBe(200);
    expect((await request(guarded).get('/admin-only').set('Cookie', studentCookie)).status).toBe(
      403
    );
  });
});

describe('dev user switcher', () => {
  it('logs in as a seeded handler with the x-dev-user header', async () => {
    await seedUsers();
    const saved = { nodeEnv: config.nodeEnv, devAuth: config.devAuth };
    config.nodeEnv = 'development';
    config.devAuth = true;

    const me = await request(app).get('/api/auth/me').set('x-dev-user', 'suresh.pawar@pict.edu');
    Object.assign(config, saved);

    expect(me.status).toBe(200);
    expect(me.body.user.role).toBe('handler');
  });

  it('ignores the header when the switcher is off', async () => {
    await seedUsers();
    const me = await request(app).get('/api/auth/me').set('x-dev-user', 'suresh.pawar@pict.edu');
    expect(me.status).toBe(401);
  });
});
