// Tests for the notifications module: notify() saves the alert and emits it to the
// person's Socket.IO room; the routes list only my alerts, count unread ones and mark
// them read. Socket.IO is replaced by a tiny fake that records what was emitted.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { config } from '../../shared/config/index.js';
import { User } from '../../shared/models/User.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../shared/testing/testDb.js';
import { createNotify } from './notify.js';

let app;
let owner;
let other;

// A fake Socket.IO: io.to(room).emit(event, data) just remembers the call.
function fakeIo() {
  const sent = [];
  return {
    sent,
    to(room) {
      return { emit: (event, data) => sent.push({ room, event, data }) };
    },
  };
}

beforeAll(async () => {
  await startTestDb();
  config.nodeEnv = 'development';
  config.devAuth = true;
  app = (await createApp()).app;
});
beforeEach(async () => {
  await clearTestDb();
  owner = await User.create({ name: 'Owner', email: 'owner@pict.edu', role: 'student' });
  other = await User.create({ name: 'Other', email: 'other@pict.edu', role: 'student' });
});
afterAll(stopTestDb);

describe('notify', () => {
  it('saves the alert and sends it live to that person only', async () => {
    const io = fakeIo();
    const notify = createNotify(io);
    await notify({
      userId: owner._id,
      type: 'MATCH_FOUND',
      title: 'Possible match',
      link: '/lost/1',
    });
    expect(io.sent).toHaveLength(1);
    expect(io.sent[0].room).toBe(`user:${owner._id}`);
    expect(io.sent[0].event).toBe('notification');
    expect(io.sent[0].data.title).toBe('Possible match');
  });
});

describe('notification routes', () => {
  it('lists my alerts with an unread count, and marks them read', async () => {
    const notify = createNotify(null);
    await notify({ userId: owner._id, type: 'MATCH_FOUND', title: 'First' });
    await notify({ userId: owner._id, type: 'CLAIM_UPDATE', title: 'Second' });
    await notify({ userId: other._id, type: 'CLAIM_UPDATE', title: 'Not mine' });

    const list = await request(app).get('/api/notifications').set('x-dev-user', owner.email);
    expect(list.body.items.map((item) => item.title)).toEqual(['Second', 'First']);
    expect(list.body.unread).toBe(2);

    const first = list.body.items[1];
    await request(app).patch(`/api/notifications/${first._id}/read`).set('x-dev-user', owner.email);
    const count = await request(app)
      .get('/api/notifications/unread-count')
      .set('x-dev-user', owner.email);
    expect(count.body.unread).toBe(1);

    await request(app).patch('/api/notifications/read-all').set('x-dev-user', owner.email);
    const after = await request(app)
      .get('/api/notifications/unread-count')
      .set('x-dev-user', owner.email);
    expect(after.body.unread).toBe(0);
  });

  it("will not mark someone else's alert", async () => {
    const notify = createNotify(null);
    const theirs = await notify({ userId: other._id, type: 'CLAIM_UPDATE', title: 'Not mine' });
    const res = await request(app)
      .patch(`/api/notifications/${theirs._id}/read`)
      .set('x-dev-user', owner.email);
    expect(res.status).toBe(404);
  });
});
