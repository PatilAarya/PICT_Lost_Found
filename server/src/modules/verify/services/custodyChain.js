// Adds hashed custody entries and checks the chain.
import crypto from 'node:crypto';
import { User } from '../../../shared/models/User.js';
import { CustodyEntry } from '../models/CustodyEntry.js';

export const GENESIS = 'GENESIS';
const MAX_RETRIES = 5;

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

export function computeHash(prevHash, entry) {
  return crypto
    .createHash('sha256')
    .update(prevHash + canonicalJson(hashedFields(entry)))
    .digest('hex');
}

export async function appendEntry({ itemId, action, actorId, actorRole, note, meta, ts }) {
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
      if (err.code !== 11000) {
        throw err;
      }
    }
  }
  throw new Error(`Could not append custody entry for item ${itemId}`);
}

export async function appendCustody({ itemId, action, actorId, note, meta }) {
  const actor = actorId ? await User.findById(actorId).select('role') : null;
  const actorRole = actor ? actor.role : 'system';
  return appendEntry({ itemId, action, actorId, actorRole, note, meta });
}

export function checkChain(entries) {
  let expectedPrev = GENESIS;
  let chainBroken = false;
  return entries.map((entry, index) => {
    const linkOk = entry.prevHash === expectedPrev && entry.seq === index + 1;
    const hashOk = computeHash(entry.prevHash, entry) === entry.hash;
    chainBroken = chainBroken || !linkOk || !hashOk;
    expectedPrev = entry.hash;
    return { entry, valid: !chainBroken };
  });
}
