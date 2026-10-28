// Makes serial numbers like PICT-F-000123.
import { Counter } from '../models/Counter.js';

const KINDS = { lost: 'L', found: 'F', claim: 'C' };

export async function nextSerial(kind) {
  const letter = KINDS[kind];
  if (!letter) {
    throw new Error(`Unknown serial kind "${kind}"`);
  }
  const counter = await Counter.findOneAndUpdate(
    { _id: letter },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  return `PICT-${letter}-${String(counter.seq).padStart(6, '0')}`;
}
