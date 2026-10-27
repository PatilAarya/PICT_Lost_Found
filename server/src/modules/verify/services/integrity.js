// Runs the custody chain check over every item, for the admin integrity page.
// Groups all entries by item, calls checkChain() on each group, and reports the
// first broken entry of each broken item. Used by routes/custodyRoutes.js.
import { FoundItem } from '../../../shared/models/FoundItem.js';
import { CustodyEntry } from '../models/CustodyEntry.js';
import { checkChain } from './custodyChain.js';

// Put entries into one list per item id, keeping their seq order.
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

// A short view of one checked entry for the linked-blocks picture.
function blockView(result) {
  return {
    seq: result.entry.seq,
    action: result.entry.action,
    ts: result.entry.ts,
    hash: result.entry.hash.slice(0, 10),
    valid: result.valid,
  };
}

// Check every chain. Returns { ok, brokenItems: [{ itemId, seq }], chains }.
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
