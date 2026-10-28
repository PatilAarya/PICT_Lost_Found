// Tests for lifecycle rules, flags and analytics.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { FoundItem } from '../../../shared/models/FoundItem.js';
import { User } from '../../../shared/models/User.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../shared/testing/testDb.js';
import { Flag } from '../models/Flag.js';
import { appendEntry } from '../services/custodyChain.js';
import { donateOldItems, transferOldDeskItems } from '../services/lifecycle.js';
import { WRONG_ANSWERS, actAs, makeItem, makePeople, makeTestApp } from './helpers.js';

const HOUR_MS = 60 * 60 * 1000;
let app;
let people;

beforeAll(async () => {
  await startTestDb();
  app = await makeTestApp();
});
beforeEach(async () => {
  await clearTestDb();
  people = await makePeople();
});
afterAll(stopTestDb);

describe('lifecycle rules', () => {
  it('moves desk items held over 24 hours to the admin office', async () => {
    const item = await makeItem(people.finder._id);
    const storedAt = new Date();
    await appendEntry({ itemId: item._id, action: 'STORED', ts: storedAt });

    expect(await transferOldDeskItems(new Date(storedAt.getTime() + 23 * HOUR_MS))).toBe(0);
    expect(await transferOldDeskItems(new Date(storedAt.getTime() + 25 * HOUR_MS))).toBe(1);
    expect((await FoundItem.findById(item._id)).status).toBe('transferred_admin');
  });

  it('donates items unclaimed for 30 days', async () => {
    const item = await makeItem(people.finder._id, 'desk', 'transferred_admin');
    expect(await donateOldItems(new Date(Date.now() + 29 * 24 * HOUR_MS))).toBe(0);
    expect(await donateOldItems(new Date(Date.now() + 31 * 24 * HOUR_MS))).toBe(1);
    expect((await FoundItem.findById(item._id)).status).toBe('donated');
  });
});

describe('abuse flags', () => {
  it('flags 3 failed checks in a week, and the admin can suspend', async () => {
    const item = await makeItem(people.finder._id);
    const other = actAs(app, people.other);
    const started = await other.post('/api/verify/claims', { foundItemId: item._id });
    for (let i = 0; i < 3; i++) {
      await other.post(`/api/verify/claims/${started.body.claim.id}/answer`, {
        answers: WRONG_ANSWERS,
      });
    }
    const flag = await Flag.findOne({ userId: people.other._id, reason: 'failed_checks' });
    expect(flag).toBeTruthy();
    expect((await User.findById(people.other._id)).flagged).toBe(true);

    const admin = actAs(app, people.admin);
    expect((await admin.get('/api/verify/flags')).body.flags).toHaveLength(1);
    await admin.patch(`/api/verify/flags/${flag._id}`, { action: 'suspend' });
    expect((await User.findById(people.other._id)).status).toBe('suspended');
    expect((await other.get('/api/verify/claims/mine')).status).toBe(403);
  });
});

describe('analytics', () => {
  it('counts items by building, category and hour', async () => {
    await makeItem(people.finder._id);
    await makeItem(people.finder._id);
    const res = await actAs(app, people.handler).get('/api/verify/analytics');
    expect(res.body.totalItems).toBe(2);
    expect(res.body.byBuilding[0].count).toBe(2);
    expect(res.body.byCategory[0]).toEqual({ label: 'wallet', count: 2 });
    expect(res.body.byHour).toHaveLength(24);
    expect((await actAs(app, people.owner).get('/api/verify/analytics')).status).toBe(403);
  });
});
