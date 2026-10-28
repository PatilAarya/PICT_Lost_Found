// Tests for answering questions and lockouts.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Claim } from '../../../shared/models/Claim.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../shared/testing/testDb.js';
import { scoreAnswer, scoreAnswers } from '../services/scoring.js';
import { CustodyEntry } from '../models/CustodyEntry.js';
import {
  RIGHT_ANSWERS,
  WRONG_ANSWERS,
  actAs,
  makeItem,
  makePeople,
  makeTestApp,
} from './helpers.js';

let app;
let people;
let item;

beforeAll(async () => {
  await startTestDb();
  app = await makeTestApp();
});
beforeEach(async () => {
  await clearTestDb();
  people = await makePeople();
  item = await makeItem(people.finder._id);
});
afterAll(stopTestDb);

async function startClaim() {
  const res = await actAs(app, people.owner).post('/api/verify/claims', { foundItemId: item._id });
  return res.body.claim.id;
}

describe('scoring', () => {
  it('ignores case and punctuation, accepts small typos, rejects wrong answers', () => {
    expect(scoreAnswer('  SBI, Debit card! ', 'sbi debit card')).toBe(1);
    expect(scoreAnswer('sbi debt card', 'sbi debit card')).toBeGreaterThanOrEqual(0.8);
    expect(scoreAnswer('hdfc', 'sbi debit card')).toBe(0);
    expect(scoreAnswer('', 'anything')).toBe(0);
  });

  it('fails when any answer scores 0, even if the average is high', () => {
    const details = [
      { promptKey: 'a', answer: 'red' },
      { promptKey: 'b', answer: 'blue' },
      { promptKey: 'c', answer: 'green' },
    ];
    const answers = [
      { promptKey: 'a', text: 'red' },
      { promptKey: 'b', text: 'blue' },
      { promptKey: 'c', text: 'pink' },
    ];
    expect(scoreAnswers(details, answers).passed).toBe(false);
  });
});

describe('claims', () => {
  it('sends the questions but never the answers or private photo ids', async () => {
    const res = await actAs(app, people.owner).post('/api/verify/claims', {
      foundItemId: item._id,
    });
    expect(res.status).toBe(201);
    expect(res.body.claim.prompts).toHaveLength(2);
    const text = JSON.stringify(res.body);
    expect(text).not.toContain('SBI debit card');
    expect(text).not.toContain('private/abc');
  });

  it('does not let the finder claim their own item', async () => {
    const res = await actAs(app, people.finder).post('/api/verify/claims', {
      foundItemId: item._id,
    });
    expect(res.status).toBe(409);
  });

  it('passes with the right answers and logs it', async () => {
    const id = await startClaim();
    const res = await actAs(app, people.owner).post(`/api/verify/claims/${id}/answer`, {
      answers: RIGHT_ANSWERS,
    });
    expect(res.body).toEqual({ passed: true });
    expect((await Claim.findById(id)).status).toBe('awaiting_handler');
    const actions = (await CustodyEntry.find().sort({ seq: 1 })).map((entry) => entry.action);
    expect(actions).toEqual(['CLAIM_SUBMITTED', 'VERIFICATION_PASSED']);
  });

  it('locks for 30 minutes after 3 failures, then 24 hours the second time', async () => {
    const id = await startClaim();
    const owner = actAs(app, people.owner);
    const url = `/api/verify/claims/${id}/answer`;

    const first = await owner.post(url, { answers: WRONG_ANSWERS });
    expect(first.body).toEqual({ passed: false, attemptsLeft: 2, lockedUntil: null });
    await owner.post(url, { answers: WRONG_ANSWERS });
    const third = await owner.post(url, { answers: WRONG_ANSWERS });
    const minutes = (new Date(third.body.lockedUntil) - Date.now()) / 60000;
    expect(minutes).toBeGreaterThan(29);
    expect(minutes).toBeLessThanOrEqual(30);
    expect((await owner.post(url, { answers: RIGHT_ANSWERS })).status).toBe(423);

    await Claim.updateOne({ _id: id }, { $set: { lockedUntil: new Date(Date.now() - 1000) } });
    for (let i = 0; i < 2; i++) {
      await owner.post(url, { answers: WRONG_ANSWERS });
    }
    const sixth = await owner.post(url, { answers: WRONG_ANSWERS });
    const hours = (new Date(sixth.body.lockedUntil) - Date.now()) / 3600000;
    expect(hours).toBeGreaterThan(23.9);
  });
});
