// The tamper-evident custody log. appendEntry() adds a hashed entry to an item's
// chain; checkChain() recomputes every hash to find edits. The hash of an entry is
// SHA-256(prevHash + canonical JSON of its fields), and the first entry uses "GENESIS".
// index.js registers appendCustody (below) as the shared service.
import crypto from 'node:crypto';
import { User } from '../../../shared/models/User.js';
import { CustodyEntry } from '../models/CustodyEntry.js';

export const GENESIS = 'GENESIS';
const MAX_RETRIES = 5;

// JSON with object keys sorted, so the same data always gives the same text (and hash).
export function canonicalJson(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`;
  }
  const keys = Object.keys(value)
    .filter((key) => value[key] !== undefined)
    .sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
}

// The fields that are protected by the hash, as plain strings and numbers.
export function hashedFields(entry) {
  return {
    itemId: String(entry.itemId),
    seq: entry.seq,
    action: entry.action,
    actorId: entry.actorId ? String(entry.actorId) : null,
    actorRole: entry.actorRole || '',
    note: entry.note || '',
    meta: entry.meta || {},
    ts: new Date(entry.ts).toISOString(),
  };
}

// SHA-256 of the previous hash followed by this entry's canonical JSON.
export function computeHash(prevHash, entry) {
  return crypto
    .createHash('sha256')
    .update(prevHash + canonicalJson(hashedFields(entry)))
    .digest('hex');
}

// Add one entry to the end of an item's chain. Retries if another write took our seq.
export async function appendEntry({ itemId, action, actorId, actorRole, note, meta, ts }) {
  // Round-trip through JSON so ObjectIds and Dates in meta become plain strings,
  // exactly as they will look when read back from the database later.
  const cleanMeta = JSON.parse(JSON.stringify(meta || {}));
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const last = await CustodyEntry.findOne({ itemId }).sort({ seq: -1 });
    const entry = {
      itemId,
      seq: last ? last.seq + 1 : 1,
      action,
      actorId: actorId || null,
      actorRole: actorRole || '',
      note: note || '',
      meta: cleanMeta,
      ts: ts || new Date(),
      prevHash: last ? last.hash : GENESIS,
    };
    entry.hash = computeHash(entry.prevHash, entry);
    try {
      return await CustodyEntry.create(entry);
    } catch (err) {
      // 11000 = duplicate key: someone else saved this seq first, so try again.
      if (err.code !== 11000) {
        throw err;
      }
    }
  }
  throw new Error(`Could not append custody entry for item ${itemId}`);
}

// The shared service from docs/CONTRACT.md: looks up the actor's role, then appends.
export async function appendCustody({ itemId, action, actorId, note, meta }) {
  const actor = actorId ? await User.findById(actorId).select('role') : null;
  const actorRole = actor ? actor.role : 'system';
  return appendEntry({ itemId, action, actorId, actorRole, note, meta });
}

// Check one item's entries (sorted by seq). Returns each entry with valid true/false.
export function checkChain(entries) {
  let expectedPrev = GENESIS;
  let chainBroken = false;
  return entries.map((entry, index) => {
    const linkOk = entry.prevHash === expectedPrev && entry.seq === index + 1;
    const hashOk = computeHash(entry.prevHash, entry) === entry.hash;
    // Once one entry is bad, everything after it can no longer be trusted.
    chainBroken = chainBroken || !linkOk || !hashOk;
    expectedPrev = entry.hash;
    return { entry, valid: !chainBroken };
  });
}
