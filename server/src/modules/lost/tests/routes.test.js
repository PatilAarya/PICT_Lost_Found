// Tests for the lost routes with a real in-memory database: reporting finds an existing
// found item and notifies the owner; posting a found item later (services.runMatching)
// matches an open report; only the owner can read a report; saved items stay private.
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../app.js';
import { config } from '../../../shared/config/index.js';
import { FoundItem } from '../../../shared/models/FoundItem.js';
import { User } from '../../../shared/models/User.js';
import { registerService, resetServices } from '../../../shared/services/registry.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../shared/testing/testDb.js';
import { matchFoundItem } from '../services/runMatching.js';

let app;
let alerts;
const place = { buildingId: 'main', floorId: '1', areaId: 'staff-room' };
const now = Date.now();

// A report body for a green bottle lost in the staff room a few hours ago.
function reportBody() {
  return {
    category: 'bottle',
    title: 'Green steel bottle',
    colors: ['green'],
    lastSeen: place,
    lostFrom: new Date(now - 5 * 3600000).toISOString(),
    lostTo: new Date(now - 3 * 3600000).toISOString(),
  };
}

// A found green bottle in the same room, found an hour ago.
function makeFoundBottle(finderId) {
  return FoundItem.create({
    serial: `PICT-F-${Math.floor(Math.random() * 900000) + 100000}`,
    finderId,
    category: 'bottle',
    title: 'Steel bottle',
    colors: ['green'],
    location: place,
    foundAt: new Date(now - 3600000),
    status: 'posted',
  });
}

// Send a request as one of the test people (dev login header).
const as = (email) => ({ 'x-dev-user': email });

beforeAll(async () => {
  await startTestDb();
  config.nodeEnv = 'development';
  config.devAuth = true;
  app = (await createApp()).app;
});
beforeEach(async () => {
  await clearTestDb();
  alerts = [];
  registerService('notify', async (alert) => alerts.push(alert));
});
afterEach(resetServices);
afterAll(stopTestDb);

describe('lost reports', () => {
  it('matches a new report with an item already handed in, and alerts the owner', async () => {
    const owner = await User.create({ name: 'Owner', email: 'owner@pict.edu', role: 'student' });
    const finder = await User.create({ name: 'Finder', email: 'finder@pict.edu', role: 'student' });
    await makeFoundBottle(finder._id);

    const created = await request(app)
      .post('/api/lost/reports')
      .set(as(owner.email))
      .send(reportBody());
    expect(created.status).toBe(201);
    expect(created.body.matchCount).toBe(1);
    expect(alerts[0].type).toBe('MATCH_FOUND');

    const detail = await request(app)
      .get(`/api/lost/reports/${created.body.report._id}`)
      .set(as(owner.email));
    expect(detail.body.report.status).toBe('matched');
    expect(detail.body.matches[0].why).toMatch(/^Same category/);
    expect(detail.body.matches[0].item.privateId).toBeUndefined();
  });

  it('matches an open report when a found item is posted later', async () => {
    const owner = await User.create({ name: 'Owner', email: 'owner@pict.edu', role: 'student' });
    const finder = await User.create({ name: 'Finder', email: 'finder@pict.edu', role: 'student' });
    await request(app).post('/api/lost/reports').set(as(owner.email)).send(reportBody());
    const item = await makeFoundBottle(finder._id);
    const saved = await matchFoundItem({ foundItemId: item._id });
    expect(saved).toHaveLength(1);
  });

  it('refuses a report whose "to" time is before its "from" time', async () => {
    await User.create({ name: 'Owner', email: 'owner@pict.edu', role: 'student' });
    const body = { ...reportBody(), lostTo: new Date(now - 9 * 3600000).toISOString() };
    const res = await request(app).post('/api/lost/reports').set(as('owner@pict.edu')).send(body);
    expect(res.status).toBe(400);
  });

  it('lets only the owner read a report', async () => {
    await User.create({ name: 'Owner', email: 'owner@pict.edu', role: 'student' });
    await User.create({ name: 'Other', email: 'other@pict.edu', role: 'student' });
    const created = await request(app)
      .post('/api/lost/reports')
      .set(as('owner@pict.edu'))
      .send(reportBody());
    const res = await request(app)
      .get(`/api/lost/reports/${created.body.report._id}`)
      .set(as('other@pict.edu'));
    expect(res.status).toBe(403);
  });
});

describe('saved items', () => {
  it('are private to their owner', async () => {
    await User.create({ name: 'Owner', email: 'owner@pict.edu', role: 'student' });
    await User.create({ name: 'Other', email: 'other@pict.edu', role: 'student' });
    await request(app)
      .post('/api/lost/saved-items')
      .set(as('owner@pict.edu'))
      .send({ label: 'My bottle', category: 'bottle' });
    const mine = await request(app).get('/api/lost/saved-items').set(as('owner@pict.edu'));
    const theirs = await request(app).get('/api/lost/saved-items').set(as('other@pict.edu'));
    expect(mine.body.items).toHaveLength(1);
    expect(theirs.body.items).toHaveLength(0);
  });
});
