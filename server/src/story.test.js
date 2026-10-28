// The whole app in one test: the integration story from docs/TEAM_PLAN.md, through the real
// HTTP routes of all four modules, with an in-memory database.
// Lost report -> found item posted -> automatic match and alert -> desk receives the item ->
// owner claims, answers wrongly once, then correctly -> desk approves -> owner sees a one-time
// code -> desk releases with the code -> report recovered -> custody chain still intact.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';
import { config } from './shared/config/index.js';
import { User } from './shared/models/User.js';
import { registerService } from './shared/services/registry.js';
import { startTestDb, stopTestDb } from './shared/testing/testDb.js';
import { createNotify } from './modules/notifications/notify.js';
import { matchFoundItem } from './modules/lost/services/runMatching.js';
import { appendCustody } from './modules/verify/services/custodyChain.js';
import { getHiddenDetailPrompts } from './modules/found/hidden-detail-prompts.js';

let app;
const HOUR = 3600000;
const place = { buildingId: 'main', floorId: '1', areaId: 'staff-room' };
const people = {
  owner: 'owner@pict.edu',
  finder: 'finder@pict.edu',
  handler: 'handler@pict.edu',
  admin: 'admin@pict.edu',
};

// A request as one of the people above (dev login header), e.g. as('owner').get(url).
function as(who) {
  const agent = request(app);
  const header = { 'x-dev-user': people[who] };
  return {
    get: (url) => agent.get(url).set(header),
    post: (url, body) => agent.post(url).set(header).send(body),
    patch: (url, body) =>
      agent
        .patch(url)
        .set(header)
        .send(body || {}),
  };
}

beforeAll(async () => {
  await startTestDb();
  config.nodeEnv = 'development';
  config.devAuth = true;
  app = (await createApp()).app;
  // What each module's init() does in server.js (without Socket.IO or the hourly job).
  registerService('notify', createNotify(null));
  registerService('runMatching', matchFoundItem);
  registerService('appendCustody', appendCustody);
  registerService('getHiddenDetailPrompts', getHiddenDetailPrompts);
  await User.create([
    { name: 'Owner', email: people.owner, role: 'student' },
    { name: 'Finder', email: people.finder, role: 'student' },
    { name: 'Desk', email: people.handler, role: 'handler' },
    { name: 'Admin', email: people.admin, role: 'admin' },
  ]);
});
afterAll(stopTestDb);

describe('the full story', () => {
  it('takes a lost bottle all the way back to its owner', async () => {
    // 1. The owner reports a green bottle lost in the staff room.
    const reported = await as('owner').post('/api/lost/reports', {
      category: 'bottle',
      title: 'Green steel bottle',
      colors: ['green'],
      lastSeen: place,
      lostFrom: new Date(Date.now() - 5 * HOUR).toISOString(),
      lostTo: new Date(Date.now() - 3 * HOUR).toISOString(),
    });
    expect(reported.status).toBe(201);
    const reportId = reported.body.report._id;

    // 2. Someone finds it and posts it, choosing the desk.
    const posted = await as('finder').post('/api/found/items', {
      category: 'bottle',
      title: 'Steel water bottle',
      colors: ['green'],
      location: place,
      foundAt: new Date(Date.now() - HOUR).toISOString(),
      custody: { type: 'desk', deskId: 'security-main-gate' },
      hiddenDetails: [
        { promptKey: 'dent', promptText: 'Any dent?', answer: 'small dent near the cap' },
        { promptKey: 'sticker', promptText: 'Any sticker?', answer: 'blue star sticker' },
      ],
    });
    expect(posted.status).toBe(201);
    const itemId = posted.body.item._id;

    // 3. The match is found automatically and the owner is told why.
    const report = await as('owner').get(`/api/lost/reports/${reportId}`);
    expect(report.body.matches).toHaveLength(1);
    expect(report.body.matches[0].why).toMatch(/^Same category, found in the same spot/);
    const alerts = await as('owner').get('/api/notifications');
    expect(alerts.body.items[0].type).toBe('MATCH_FOUND');

    // 4. The desk receives the item.
    expect((await as('handler').patch(`/api/verify/incoming/${itemId}/receive`)).status).toBe(200);

    // 5. The owner claims it: one wrong try, then the right answers.
    const claimed = await as('owner').post('/api/verify/claims', {
      foundItemId: itemId,
      lostReportId: reportId,
    });
    const claimId = claimed.body.claim.id;
    const wrong = await as('owner').post(`/api/verify/claims/${claimId}/answer`, {
      answers: [
        { promptKey: 'dent', text: 'no dent' },
        { promptKey: 'sticker', text: 'none' },
      ],
    });
    expect(wrong.body).toMatchObject({ passed: false, attemptsLeft: 2 });
    const right = await as('owner').post(`/api/verify/claims/${claimId}/answer`, {
      answers: [
        { promptKey: 'dent', text: 'Small dent near the cap' },
        { promptKey: 'sticker', text: 'blue star sticker!' },
      ],
    });
    expect(right.body.passed).toBe(true);

    // 6. The desk approves; the owner sees the one-time code, once.
    await as('handler').patch(`/api/verify/claims/${claimId}/decision`, { decision: 'approve' });
    const code = await as('owner').get(`/api/verify/claims/${claimId}/code`);
    expect(code.body.code).toMatch(/^\d{6}$/);
    expect((await as('owner').get(`/api/verify/claims/${claimId}/code`)).status).toBe(410);

    // 7. The desk releases it with the code and the owner's college ID.
    const released = await as('handler').post('/api/verify/handover', {
      claimId,
      code: code.body.code,
      idChecked: true,
    });
    expect(released.status).toBe(200);

    // 8. Everything shows the happy ending, and the custody chain is untouched.
    const after = await as('owner').get(`/api/lost/reports/${reportId}`);
    expect(after.body.report.status).toBe('recovered');
    const item = await as('finder').get(`/api/found/items/${itemId}`);
    expect(item.body.item.status).toBe('released');
    const chain = await as('handler').get(`/api/verify/custody/${itemId}`);
    const actions = chain.body.entries.map((entry) => entry.action);
    expect(actions[0]).toBe('POSTED');
    expect(actions).toContain('VERIFICATION_FAILED');
    expect(actions.at(-1)).toBe('RELEASED');
    const integrity = await as('admin').get('/api/verify/custody/verify');
    expect(integrity.body.ok).toBe(true);
  });
});
