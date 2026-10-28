// What the lost routes send back. A match is shown with the found item's PUBLIC view only:
// the blurred photo URL, never the private original or the secret answers.
// Also builds the status timeline for a report. Used by routes/reportRoutes.js.
import { whyThisMatch } from './explain.js';

// The public view of a found item, safe to show the person who lost something.
export function publicFoundItem(item) {
  return {
    id: item._id,
    serial: item.serial,
    title: item.title,
    category: item.category,
    colors: item.colors,
    imageUrl: item.images && item.images[0] ? item.images[0].publicUrl : '',
    location: item.location,
    foundAt: item.foundAt,
    status: item.status,
    custodyType: item.custody ? item.custody.type : 'finder',
    deskId: item.custody ? item.custody.deskId : undefined,
  };
}

// One match with its found item and the plain-language reason.
export function matchView(match, item) {
  return {
    id: match._id,
    total: match.total,
    breakdown: match.breakdown,
    why: whyThisMatch(match.breakdown),
    seen: match.seen,
    createdAt: match.createdAt,
    item: publicFoundItem(item),
  };
}

// The steps a report goes through, marked done up to its current status.
export function reportTimeline(report) {
  const order = ['open', 'matched', 'claim_in_progress', 'recovered'];
  const reached = order.indexOf(report.status);
  const labels = ['Reported', 'Possible match found', 'Claim in progress', 'Back with you'];
  const steps = labels.map((label, index) => ({ label, done: index <= reached }));
  steps[0].at = report.createdAt;
  if (report.status === 'closed') {
    steps.push({ label: 'Closed by you', done: true });
  }
  return steps;
}
