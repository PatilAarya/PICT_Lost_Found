// Runs the match engine against the database, in both directions:
// - matchFoundItem: a found item was just posted; compare it with every open lost report.
// - matchLostReport: a lost report was just made; compare it with every found item still held.
// Good pairs are saved as Match documents; the report becomes "matched" and its owner gets a
// MATCH_FOUND notification with the "why this match" sentence (through services.notify).
import { FoundItem } from '../../../shared/models/FoundItem.js';
import { LostReport } from '../../../shared/models/LostReport.js';
import { services } from '../../../shared/services/registry.js';
import { Match } from '../models/Match.js';
import { isGoodMatch, score } from './matching.js';
import { whyThisMatch } from './explain.js';

// Found items that can still be handed back, and reports that still want a match.
const HELD_STATUSES = ['posted', 'in_custody'];
const SEARCHING_STATUSES = ['open', 'matched'];

// Save one good pair. A new pair also updates the report and tells its owner.
async function saveMatch(report, item, result) {
  const existing = await Match.findOne({ lostReportId: report._id, foundItemId: item._id });
  if (existing) {
    // Already known: just refresh the numbers, do not notify again.
    existing.total = result.total;
    existing.breakdown = result.breakdown;
    await existing.save();
    return existing;
  }
  const match = await Match.create({
    lostReportId: report._id,
    foundItemId: item._id,
    total: result.total,
    breakdown: result.breakdown,
  });
  if (report.status === 'open') {
    await LostReport.updateOne({ _id: report._id }, { $set: { status: 'matched' } });
  }
  await services.notify({
    userId: report.ownerId,
    type: 'MATCH_FOUND',
    title: `Possible match for "${report.title}"`,
    body: whyThisMatch(result.breakdown),
    link: `/lost/${report._id}`,
    data: { lostReportId: report._id, foundItemId: item._id, total: result.total },
  });
  return match;
}

// Score every pair and save the good ones. Returns the saved matches.
async function matchPairs(pairs) {
  const saved = [];
  for (const { report, item } of pairs) {
    const result = score(report, item);
    if (isGoodMatch(result)) {
      saved.push(await saveMatch(report, item, result));
    }
  }
  return saved;
}

// A found item was posted: compare it with every lost report still searching.
// Registered as services.runMatching (contract section D).
export async function matchFoundItem({ foundItemId }) {
  const item = await FoundItem.findById(foundItemId);
  if (!item || !HELD_STATUSES.includes(item.status)) {
    return [];
  }
  const reports = await LostReport.find({ status: { $in: SEARCHING_STATUSES } });
  return matchPairs(reports.map((report) => ({ report, item })));
}

// A lost report was made: compare it with every found item still held.
export async function matchLostReport(report) {
  const items = await FoundItem.find({ status: { $in: HELD_STATUSES } });
  return matchPairs(items.map((item) => ({ report, item })));
}
