// Demo alerts for development.
import { LostReport } from '../../shared/models/LostReport.js';
import { Notification } from './Notification.js';

export default async function seed() {
  const matched = await LostReport.find({ status: 'matched' });
  for (const report of matched) {
    const link = `/lost/${report._id}`;
    const exists = await Notification.findOne({ userId: report.ownerId, link });
    if (exists) continue;
    await Notification.create({
      userId: report.ownerId,
      type: 'MATCH_FOUND',
      title: `Possible match for "${report.title}"`,
      body: 'An item handed in looks like yours. Open the report to see why.',
      link,
      data: { lostReportId: report._id },
    });
  }
}
