// Checks the demo seed: 40 items and 10 claims, every custody chain valid, and
// running it a second time adds nothing (idempotent).
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Claim } from '../../../shared/models/Claim.js';
import { FoundItem } from '../../../shared/models/FoundItem.js';
import { startTestDb, stopTestDb } from '../../../shared/testing/testDb.js';
import seedUsers from '../../auth/seed.js';
import seedVerify from '../seed.js';
import { CustodyEntry } from '../models/CustodyEntry.js';
import { verifyAllChains } from '../services/integrity.js';

beforeAll(startTestDb);
afterAll(stopTestDb);

describe('verify seed', () => {
  it('creates realistic data once, with valid chains', async () => {
    await seedUsers();
    await seedVerify();
    const entriesAfterFirst = await CustodyEntry.countDocuments();
    await seedVerify();

    expect(await FoundItem.countDocuments()).toBe(40);
    expect(await Claim.countDocuments()).toBe(10);
    expect(await CustodyEntry.countDocuments()).toBe(entriesAfterFirst);
    expect((await verifyAllChains()).ok).toBe(true);
  });
});
