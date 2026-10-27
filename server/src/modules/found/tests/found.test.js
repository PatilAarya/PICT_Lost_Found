// Tests for the found module: desk ranking, secret questions, and the item routes.
// Posting must log POSTED and DROPPED_AT_DESK in the custody log, set the desk deadline,
// ask for matching, and refuse fewer than two secret answers. Reading an item must
// never return the secret answers or the private photo id.
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../app.js';
import { config } from '../../../shared/config/index.js';
import { User } from '../../../shared/models/User.js';
import { registerService, resetServices } from '../../../shared/services/registry.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../shared/testing/testDb.js';
import { rankDesks } from '../desk-suggestion.js';
import { getHiddenDetailPrompts } from '../hidden-detail-prompts.js';

let app;
let calls;

// A valid "post found item" body; tests change one field at a time.
function itemBody(changes = {}) {
  return {
    category: 'wallet',
    title: 'Brown leather wallet',
    location: { buildingId: 'main', floorId: 'g', areaId: 'entrance' },
    foundAt: new Date().toISOString(),
    custody: { type: 'desk', deskId: 'security-main-gate' },
    images: [{ publicUrl: '/api/found/files/a.jpg', privateId: 'local:private/a.jpg', order: 0 }],
    hiddenDetails: [
      { promptKey: 'contents', promptText: 'Name one card inside', answer: 'SBI debit card' },
      { promptKey: 'material', promptText: 'Describe the material', answer: 'Torn brown leather' },
    ],
    ...changes,
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
  await User.create({ name: 'Finder', email: 'finder@pict.edu', role: 'student' });
  // Record calls to the services instead of running the real modules.
  calls = [];
  registerService('appendCustody', async (entry) => calls.push(entry.action));
  registerService('runMatching', async () => calls.push('MATCHING'));
});
afterEach(resetServices);
afterAll(stopTestDb);

describe('desk suggestion', () => {
  it('puts a desk in the same building and floor first', () => {
    expect(rankDesks({ buildingId: 'lab', floorId: '1' })[0].id).toBe('lab-office');
  });

  it('falls back to desks that list the building as nearby', () => {
    const ids = rankDesks({ buildingId: 'lab', floorId: '2' }).map((desk) => desk.id);
    expect(ids.indexOf('admin-office')).toBeLessThan(ids.indexOf('security-main-gate'));
  });
});

describe('secret questions', () => {
  it('gives at least two questions for every category, and "other" for unknown ones', () => {
    for (const category of ['id_card', 'phone', 'wallet', 'keys', 'other']) {
      expect(getHiddenDetailPrompts(category).length).toBeGreaterThanOrEqual(2);
    }
    expect(getHiddenDetailPrompts('umbrella')).toEqual(getHiddenDetailPrompts('other'));
  });
});

describe('POST /api/found/items', () => {
  it('saves the item, logs custody, sets the desk deadline and asks for matching', async () => {
    const res = await request(app)
      .post('/api/found/items')
      .set('x-dev-user', 'finder@pict.edu')
      .send(itemBody());
    expect(res.status).toBe(201);
    expect(res.body.item.serial).toMatch(/^PICT-F-\d{6}$/);
    expect(calls).toEqual(['POSTED', 'DROPPED_AT_DESK', 'MATCHING']);
    const hoursLeft = (new Date(res.body.item.expiresAt) - Date.now()) / 3600000;
    expect(Math.round(hoursLeft)).toBe(config.holdHoursDesk);
  });

  it('does not log a desk drop or set a deadline when the finder keeps the item', async () => {
    const res = await request(app)
      .post('/api/found/items')
      .set('x-dev-user', 'finder@pict.edu')
      .send(itemBody({ custody: { type: 'finder' } }));
    expect(res.status).toBe(201);
    expect(calls).toEqual(['POSTED', 'MATCHING']);
    expect(res.body.item.expiresAt).toBeNull();
  });

  it('refuses an item with only one secret answer', async () => {
    const body = itemBody();
    body.hiddenDetails = body.hiddenDetails.slice(0, 1);
    const res = await request(app)
      .post('/api/found/items')
      .set('x-dev-user', 'finder@pict.edu')
      .send(body);
    expect(res.status).toBe(400);
  });
});

describe('GET /api/found/items/:id', () => {
  it('never returns the secret answers or the private photo id', async () => {
    const posted = await request(app)
      .post('/api/found/items')
      .set('x-dev-user', 'finder@pict.edu')
      .send(itemBody());
    const res = await request(app)
      .get(`/api/found/items/${posted.body.item._id}`)
      .set('x-dev-user', 'finder@pict.edu');
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain('SBI debit card');
    expect(res.body.item.images[0].privateId).toBeUndefined();
    expect(res.body.item.images[0].publicUrl).toBe('/api/found/files/a.jpg');
  });
});
