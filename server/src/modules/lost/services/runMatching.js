// Runs the match engine on the database and saves matches.
import { FoundItem } from '../../../shared/models/FoundItem.js';
import { LostReport } from '../../../shared/models/LostReport.js';
import { services } from '../../../shared/services/registry.js';
import { Match } from '../models/Match.js';
import { isGoodMatch, score } from './matching.js';
import { whyThisMatch } from './explain.js';

const HELD_STATUSES = ['posted', 'in_custody'];
const SEARCHING_STATUSES = ['open', 'matched'];

async function saveMatch(report, item, result) {
  const existing = await Match.findOne({ lostReportId: report._id, foundItemId: item._id });
  if (existing) {
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

export async function matchFoundItem({ foundItemId }) {
  const item = await FoundItem.findById(foundItemId);
  if (!item || !HELD_STATUSES.includes(item.status)) {
    return [];
  }
  const reports = await LostReport.find({ status: { $in: SEARCHING_STATUSES } });
  return matchPairs(reports.map((report) => ({ report, item })));
}

export async function matchLostReport(report) {
  const items = await FoundItem.find({ status: { $in: HELD_STATUSES } });
  return matchPairs(items.map((item) => ({ report, item })));
}
