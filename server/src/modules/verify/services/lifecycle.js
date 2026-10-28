// Hourly rules for reminders and expiring items.
import { config } from '../../../shared/config/index.js';
import { Claim } from '../../../shared/models/Claim.js';
import { FoundItem } from '../../../shared/models/FoundItem.js';
import { CustodyEntry } from '../models/CustodyEntry.js';
import { appendCustody } from './custodyChain.js';
import { notifyUser } from './notifyHelpers.js';

const HOUR_MS = 60 * 60 * 1000;
const WARN_HOURS_BEFORE = 6;

async function deskItemsStoredBetween(from, to) {
  const stored = await CustodyEntry.find({
    action: 'STORED',
    ts: { $gt: from, $lte: to },
  }).distinct('itemId');
  return FoundItem.find({ _id: { $in: stored }, status: 'in_custody', 'custody.type': 'desk' });
}

export async function warnBeforeTransfer(now = new Date()) {
  const windowEnd = new Date(now.getTime() - (config.holdHoursDesk - WARN_HOURS_BEFORE) * HOUR_MS);
  const windowStart = new Date(windowEnd.getTime() - HOUR_MS);
  const items = await deskItemsStoredBetween(windowStart, windowEnd);
  for (const item of items) {
    const claims = await Claim.find({
      foundItemId: item._id,
      status: { $in: ['answering', 'locked'] },
    });
    for (const claim of claims) {
      await notifyUser(
        claim.claimantId,
        'ITEM_EXPIRING',
        `${item.title} moves to the admin office in 6 hours`,
        'Finish your claim at the desk before then.',
        `/verify/claim/${claim._id}`
      );
    }
  }
  return items.length;
}

export async function transferOldDeskItems(now = new Date()) {
  const cutoff = new Date(now.getTime() - config.holdHoursDesk * HOUR_MS);
  const items = await deskItemsStoredBetween(new Date(0), cutoff);
  for (const item of items) {
    item.status = 'transferred_admin';
    await item.save();
    await appendCustody({
      itemId: item._id,
      action: 'TRANSFERRED_TO_ADMIN',
      note: `Held over ${config.holdHoursDesk} hours`,
    });
    await notifyUser(
      item.finderId,
      'ITEM_STATUS',
      `${item.title} moved to the admin office`,
      'Nobody collected it from the desk in time.',
      '/found'
    );
  }
  return items.length;
}

export async function donateOldItems(now = new Date()) {
  const cutoff = new Date(now.getTime() - config.donateAfterDays * 24 * HOUR_MS);
  const items = await FoundItem.find({
    createdAt: { $lte: cutoff },
    status: { $in: ['posted', 'in_custody', 'transferred_admin'] },
  });
  for (const item of items) {
    item.status = 'donated';
    await item.save();
    await appendCustody({
      itemId: item._id,
      action: 'DONATED',
      note: `Unclaimed for ${config.donateAfterDays} days`,
    });
  }
  return items.length;
}

export async function runLifecycle(now = new Date()) {
  const warned = await warnBeforeTransfer(now);
  const transferred = await transferOldDeskItems(now);
  const donated = await donateOldItems(now);
  return { warned, transferred, donated };
}
