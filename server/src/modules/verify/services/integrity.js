// Checks every item's custody chain for changes.
import { FoundItem } from '../../../shared/models/FoundItem.js';
import { CustodyEntry } from '../models/CustodyEntry.js';
import { checkChain } from './custodyChain.js';

function groupByItem(entries) {
  const groups = new Map();
  for (const entry of entries) {
    const key = String(entry.itemId);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(entry);
  }
  return groups;
}

function blockView(result) {
  return {
    seq: result.entry.seq,
    action: result.entry.action,
    ts: result.entry.ts,
    hash: result.entry.hash.slice(0, 10),
    valid: result.valid,
  };
}

export async function verifyAllChains() {
  const entries = await CustodyEntry.find().sort({ itemId: 1, seq: 1 }).lean();
  const groups = groupByItem(entries);
  const items = await FoundItem.find({ _id: { $in: [...groups.keys()] } })
    .select('serial title')
    .lean();
  const itemById = new Map(items.map((item) => [String(item._id), item]));

  const brokenItems = [];
  const chains = [];
  for (const [itemId, itemEntries] of groups) {
    const results = checkChain(itemEntries);
    const firstBad = results.find((result) => !result.valid);
    if (firstBad) {
      brokenItems.push({ itemId, seq: firstBad.entry.seq });
    }
    const item = itemById.get(itemId) || {};
    chains.push({ itemId, serial: item.serial, title: item.title, blocks: results.map(blockView) });
  }
  return { ok: brokenItems.length === 0, brokenItems, chains };
}
