// Lost report routes, mounted under /api/lost:
//   POST  /reports            report a lost item (then match it against found items)
//   GET   /reports/mine       my reports, newest first, with how many matches each has
//   GET   /reports/:id        one report with its timeline and its matches, best first
//   PATCH /reports/:id/close  I found it myself or gave up: stop matching it
import express from 'express';
import { HttpError } from '../../../shared/utils/httpError.js';
import { nextSerial } from '../../../shared/utils/serial.js';
import { LostReport } from '../../../shared/models/LostReport.js';
import { FoundItem } from '../../../shared/models/FoundItem.js';
import { Match } from '../models/Match.js';
import { SavedItem } from '../models/SavedItem.js';
import { reportSchema } from '../schemas.js';
import { matchLostReport } from '../services/runMatching.js';
import { matchView, reportTimeline } from '../services/views.js';

const router = express.Router();

// Find a report that belongs to this user (staff may look at any), or stop with 404/403.
async function findOwnReport(req) {
  const report = await LostReport.findById(req.params.id).catch(() => null);
  if (!report) throw new HttpError(404, 'NOT_FOUND', 'This lost report does not exist.');
  const isStaff = ['handler', 'admin'].includes(req.user.role);
  if (!isStaff && String(report.ownerId) !== String(req.user._id)) {
    throw new HttpError(403, 'FORBIDDEN', 'Only the person who lost it can see this report.');
  }
  return report;
}

router.post('/reports', async (req, res) => {
  const { saveForLater, ...data } = reportSchema.parse(req.body);
  if (saveForLater) {
    const saved = await SavedItem.create({ ...data, userId: req.user._id, label: data.title });
    data.savedItemId = saved._id;
  }
  const report = await LostReport.create({
    ...data,
    serial: await nextSerial('lost'),
    ownerId: req.user._id,
  });
  const matches = await matchLostReport(report);
  res.status(201).json({ report, matchCount: matches.length });
});

router.get('/reports/mine', async (req, res) => {
  const reports = await LostReport.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
  // Count matches per report in one query: [{ _id: reportId, count }].
  const counts = await Match.aggregate([
    { $match: { lostReportId: { $in: reports.map((report) => report._id) } } },
    { $group: { _id: '$lostReportId', count: { $sum: 1 } } },
  ]);
  const countById = new Map(counts.map((row) => [String(row._id), row.count]));
  res.json({
    reports: reports.map((report) => ({
      ...report.toObject(),
      matchCount: countById.get(String(report._id)) || 0,
    })),
  });
});

router.get('/reports/:id', async (req, res) => {
  const report = await findOwnReport(req);
  const matches = await Match.find({ lostReportId: report._id }).sort({ total: -1 });
  const items = await FoundItem.find({ _id: { $in: matches.map((match) => match.foundItemId) } });
  const itemById = new Map(items.map((item) => [String(item._id), item]));
  const views = matches
    .filter((match) => itemById.has(String(match.foundItemId)))
    .map((match) => matchView(match, itemById.get(String(match.foundItemId))));
  // The owner has now seen every match on this report.
  if (String(report.ownerId) === String(req.user._id)) {
    await Match.updateMany({ lostReportId: report._id, seen: false }, { $set: { seen: true } });
  }
  res.json({ report, timeline: reportTimeline(report), matches: views });
});

router.patch('/reports/:id/close', async (req, res) => {
  const report = await findOwnReport(req);
  if (report.status === 'recovered') {
    throw new HttpError(409, 'ALREADY_RECOVERED', 'This item is already back with you.');
  }
  report.status = 'closed';
  await report.save();
  res.json({ report });
});

export default router;
