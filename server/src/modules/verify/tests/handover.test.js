// Tests for desk decisions and the handover code.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Claim } from '../../../shared/models/Claim.js';
import { FoundItem } from '../../../shared/models/FoundItem.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../shared/testing/testDb.js';
import { CustodyEntry } from '../models/CustodyEntry.js';
import { RIGHT_ANSWERS, actAs, makeItem, makePeople, makeTestApp } from './helpers.js';

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

async function approvedClaim(item) {
  const owner = actAs(app, people.owner);
  const started = await owner.post('/api/verify/claims', { foundItemId: item._id });
  const id = started.body.claim.id;
  await owner.post(`/api/verify/claims/${id}/answer`, { answers: RIGHT_ANSWERS });
  const queue = await actAs(app, people.handler).get('/api/verify/desk/queue');
  expect(queue.body.claims[0].comparisons[0].expected).toBe('SBI debit card');
  await actAs(app, people.handler).patch(`/api/verify/claims/${id}/decision`, {
    decision: 'approve',
    note: 'Answers match',
  });
  return id;
}

describe('handover code', () => {
  it('is shown once and releases the item with the right code', async () => {
    const item = await makeItem(people.finder._id);
    const id = await approvedClaim(item);
    const owner = actAs(app, people.owner);
    const handler = actAs(app, people.handler);

    const shown = await owner.get(`/api/verify/claims/${id}/code`);
    expect(shown.body.code).toMatch(/^\d{6}$/);
    expect((await owner.get(`/api/verify/claims/${id}/code`)).status).toBe(410);

    const wrongCode = shown.body.code === '000000' ? '111111' : '000000';
    const wrong = await handler.post('/api/verify/handover', {
      claimId: id,
      code: wrongCode,
      idChecked: true,
    });
    expect(wrong.status).toBe(400);
    const noId = await handler.post('/api/verify/handover', { claimId: id, code: shown.body.code });
    expect(noId.status).toBe(400);

    const ok = await handler.post('/api/verify/handover', {
      claimId: id,
      code: shown.body.code,
      idChecked: true,
    });
    expect(ok.status).toBe(200);
    expect((await FoundItem.findById(item._id)).status).toBe('released');
    expect((await Claim.findById(id)).status).toBe('released');

    const reused = await handler.post('/api/verify/handover', {
      claimId: id,
      code: shown.body.code,
      idChecked: true,
    });
    expect(reused.status).toBe(409);
    const actions = (await CustodyEntry.find().sort({ seq: 1 })).map((entry) => entry.action);
    expect(actions).toEqual(['CLAIM_SUBMITTED', 'VERIFICATION_PASSED', 'APPROVED', 'RELEASED']);
  });

  it('refuses an expired code', async () => {
    const item = await makeItem(people.finder._id);
    const id = await approvedClaim(item);
    const { code } = (await actAs(app, people.owner).get(`/api/verify/claims/${id}/code`)).body;
    await Claim.updateOne(
      { _id: id },
      { $set: { handoverExpiresAt: new Date(Date.now() - 1000) } }
    );
    const res = await actAs(app, people.handler).post('/api/verify/handover', {
      claimId: id,
      code,
      idChecked: true,
    });
    expect(res.status).toBe(410);
  });

  it('keeps students away from the desk queue', async () => {
    expect((await actAs(app, people.owner).get('/api/verify/desk/queue')).status).toBe(403);
  });
});

describe('finder-kept items and incoming items', () => {
  it('releases once both owner and finder confirm', async () => {
    const item = await makeItem(people.finder._id, 'finder', 'posted');
    const id = await approvedClaim(item);
    await actAs(app, people.owner).post('/api/verify/handover/confirm', { claimId: id });
    expect((await Claim.findById(id)).status).toBe('approved');
    await actAs(app, people.finder).post('/api/verify/handover/confirm', { claimId: id });
    expect((await Claim.findById(id)).status).toBe('released');
  });

  it('receives an item dropped at the desk', async () => {
    const item = await makeItem(people.finder._id, 'desk', 'posted');
    const handler = actAs(app, people.handler);
    expect((await handler.get('/api/verify/incoming')).body.items).toHaveLength(1);
    await handler.patch(`/api/verify/incoming/${item._id}/receive`);
    expect((await FoundItem.findById(item._id)).status).toBe('in_custody');
    const actions = (await CustodyEntry.find().sort({ seq: 1 })).map((entry) => entry.action);
    expect(actions).toEqual(['RECEIVED_BY_HANDLER', 'STORED']);
  });
});
