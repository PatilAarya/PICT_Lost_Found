// Makes the serial numbers printed on ticket stubs: PICT-L-000045 (lost),
// PICT-F-000123 (found), PICT-C-000007 (claim). Uses the Counter model.
// Call it right before saving a new LostReport, FoundItem or Claim.
import { Counter } from '../models/Counter.js';

const KINDS = { lost: 'L', found: 'F', claim: 'C' };

// Return the next serial for 'lost', 'found' or 'claim'.
export async function nextSerial(kind) {
  const letter = KINDS[kind];
  if (!letter) {
    throw new Error(`Unknown serial kind "${kind}"`);
  }
  // $inc plus upsert is a single atomic step: MongoDB creates the counter if it is
  // missing and returns the increased value, with no gap for another request to sneak in.
  const counter = await Counter.findOneAndUpdate(
    { _id: letter },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  return `PICT-${letter}-${String(counter.seq).padStart(6, '0')}`;
}
