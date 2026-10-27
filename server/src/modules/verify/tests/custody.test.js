// Tests for the custody hash chain: entries link to each other, two writes at the
// same moment both succeed with different seq numbers, and a direct database edit
// is caught by the integrity check.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { clearTestDb, startTestDb, stopTestDb } from '../../../shared/testing/testDb.js';
import { CustodyEntry } from '../models/CustodyEntry.js';
import { GENESIS, appendEntry, canonicalJson } from '../services/custodyChain.js';
import { verifyAllChains } from '../services/integrity.js';

const itemId = new mongoose.Types.ObjectId();

beforeAll(startTestDb);
beforeEach(clearTestDb);
afterAll(stopTestDb);

describe('custody chain', () => {
  it('sorts keys so the same data always gives the same JSON', () => {
    expect(canonicalJson({ b: 1, a: { d: 2, c: 3 } })).toBe('{"a":{"c":3,"d":2},"b":1}');
  });

  it('links each entry to the one before', async () => {
    const first = await appendEntry({ itemId, action: 'POSTED', meta: { deskId: 'gate' } });
    const second = await appendEntry({ itemId, action: 'DROPPED_AT_DESK' });
    expect(first.seq).toBe(1);
    expect(first.prevHash).toBe(GENESIS);
    expect(second.seq).toBe(2);
    expect(second.prevHash).toBe(first.hash);
    expect((await verifyAllChains()).ok).toBe(true);
  });

  it('gives different seq numbers to writes made at the same moment', async () => {
    await Promise.all([
      appendEntry({ itemId, action: 'POSTED' }),
      appendEntry({ itemId, action: 'STORED' }),
      appendEntry({ itemId, action: 'RECEIVED_BY_HANDLER' }),
    ]);
    const seqs = (await CustodyEntry.find({ itemId }).sort({ seq: 1 })).map((entry) => entry.seq);
    expect(seqs).toEqual([1, 2, 3]);
    expect((await verifyAllChains()).ok).toBe(true);
  });

  it('catches an entry edited directly in the database', async () => {
    await appendEntry({ itemId, action: 'POSTED' });
    await appendEntry({ itemId, action: 'STORED', note: 'Shelf B' });
    await appendEntry({ itemId, action: 'RELEASED' });
    await CustodyEntry.collection.updateOne({ itemId, seq: 2 }, { $set: { note: 'Shelf Z' } });

    const result = await verifyAllChains();
    expect(result.ok).toBe(false);
    expect(result.brokenItems).toEqual([{ itemId: String(itemId), seq: 2 }]);
    const validFlags = result.chains[0].blocks.map((block) => block.valid);
    expect(validFlags).toEqual([true, false, false]);
  });
});
