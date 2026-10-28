// Adds demo lost reports and saved items, then runs matching.
import { LostReport } from '../../shared/models/LostReport.js';
import { User } from '../../shared/models/User.js';
import { nextSerial } from '../../shared/utils/serial.js';
import { SavedItem } from './models/SavedItem.js';
import { matchLostReport } from './services/runMatching.js';
import { DEMO_REPORTS, DEMO_SAVED_ITEMS } from './seedData.js';

const HOUR_MS = 60 * 60 * 1000;

function hoursAgo(hours) {
  return new Date(Date.now() - hours * HOUR_MS);
}

async function seedReport(demo) {
  const owner = await User.findOne({ email: demo.ownerEmail });
  if (!owner) return;
  const exists = await LostReport.findOne({ ownerId: owner._id, title: demo.title });
  if (exists) return;
  const report = await LostReport.create({
    serial: await nextSerial('lost'),
    ownerId: owner._id,
    category: demo.category,
    title: demo.title,
    description: demo.description,
    colors: demo.colors,
    brand: demo.brand || '',
    lastSeen: demo.lastSeen,
    lostFrom: hoursAgo(demo.hoursAgoFrom),
    lostTo: hoursAgo(demo.hoursAgoTo),
  });
  await matchLostReport(report);
}

async function seedSavedItem(demo) {
  const owner = await User.findOne({ email: demo.ownerEmail });
  if (!owner) return;
  const exists = await SavedItem.findOne({ userId: owner._id, label: demo.label });
  if (exists) return;
  await SavedItem.create({
    userId: owner._id,
    label: demo.label,
    category: demo.category,
    colors: demo.colors,
    brand: demo.brand || '',
    description: demo.description || '',
    stickers: demo.stickers || '',
  });
}

export default async function seed() {
  for (const demo of DEMO_REPORTS) {
    await seedReport(demo);
  }
  for (const demo of DEMO_SAVED_ITEMS) {
    await seedSavedItem(demo);
  }
}
