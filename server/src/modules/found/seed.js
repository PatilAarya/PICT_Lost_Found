// server/src/modules/found/seed.js
// Demo found items for development and the dev user switcher.
// Idempotent: looks up by (finderId, title) and skips if that pair already
// exists, so running `npm run seed` again never creates duplicates.
import { FoundItem } from '../../shared/models/FoundItem.js';
import { User } from '../../shared/models/User.js';
import { nextSerial } from '../../shared/utils/serial.js';
import { getHiddenDetailPrompts } from './hidden-detail-prompts.js';

// Each demo item: who found it, what it is, where, and what state it's in.
// finderEmail must match an email from auth/seed.js's SEED_USERS list.
const DEMO_ITEMS = [
  {
    finderEmail: 'aarav.sharma@pict.edu',
    category: 'id_card',
    title: 'College ID card',
    description: 'Found near the main entrance, lying on the information desk.',
    colors: ['blue', 'white'],
    brand: '',
    location: { buildingId: 'main', floorId: 'g', areaId: 'entrance', x: 0.4, y: 0.5 },
    custody: { type: 'desk', deskId: 'security-main-gate' },
    status: 'posted',
    daysAgo: 0,
  },
  {
    finderEmail: 'priya.kulkarni@pict.edu',
    category: 'phone',
    title: 'Black Android phone',
    description: 'Left on a workbench in computer lab 1, screen cracked slightly.',
    colors: ['black'],
    brand: 'Samsung',
    location: { buildingId: 'lab', floorId: '1', areaId: 'computer-lab-1', x: 0.5, y: 0.5 },
    custody: { type: 'desk', deskId: 'lab-office' },
    status: 'in_custody',
    daysAgo: 1,
  },
  {
    finderEmail: 'rohan.deshmukh@pict.edu',
    category: 'bottle',
    title: 'Steel water bottle',
    description: 'Dark green bottle with a dent near the base, found in the staff room.',
    colors: ['green'],
    brand: 'Milton',
    location: { buildingId: 'main', floorId: '1', areaId: 'staff-room', x: 0.3, y: 0.6 },
    custody: { type: 'finder', deskId: '' },
    status: 'posted',
    daysAgo: 2,
  },
  {
    finderEmail: 'sneha.patil@pict.edu',
    category: 'keys',
    title: 'Keychain with 3 keys',
    description: 'A small red keychain with three keys and a bike key fob, found in the library.',
    colors: ['red'],
    brand: '',
    location: { buildingId: 'main', floorId: '2', areaId: 'library', x: 0.6, y: 0.4 },
    custody: { type: 'desk', deskId: 'security-main-gate' },
    status: 'posted',
    daysAgo: 1,
  },
  {
    finderEmail: 'aditya.joshi@pict.edu',
    category: 'earbuds',
    title: 'White wireless earbuds case',
    description: 'Earbuds case found on a canteen table, one earbud missing.',
    colors: ['white'],
    brand: 'boAt',
    location: { buildingId: 'lab', floorId: 'g', areaId: 'canteen', x: 0.5, y: 0.5 },
    custody: { type: 'finder', deskId: '' },
    status: 'posted',
    daysAgo: 3,
  },
  {
    finderEmail: 'ananya.iyer@pict.edu',
    category: 'bag',
    title: 'Grey backpack',
    description: 'Found in the ground floor corridor, has a few notebooks inside.',
    colors: ['grey'],
    brand: '',
    location: { buildingId: 'main', floorId: 'g', areaId: 'corridor', x: 0.5, y: 0.7 },
    custody: { type: 'desk', deskId: 'admin-office' },
    status: 'posted',
    daysAgo: 0,
  },
];

// Build one hidden detail for an item's category, using the real prompt text
// so it looks and behaves exactly like a user-submitted one.
function buildHiddenDetail(category) {
  const prompts = getHiddenDetailPrompts(category);
  const prompt = prompts[0];
  return [{ promptKey: prompt.promptKey, promptText: prompt.promptText, answer: 'Demo answer for defense purposes.' }];
}

// Insert demo found items.
export default async function seed() {
  for (const demo of DEMO_ITEMS) {
    const finder = await User.findOne({ email: demo.finderEmail });
    if (!finder) {
      continue; // auth seed must run first; skip quietly if the user is missing.
    }

    const alreadyExists = await FoundItem.findOne({ finderId: finder._id, title: demo.title });
    if (alreadyExists) {
      continue; // idempotent: don't create the same demo item twice.
    }

    const serial = await nextSerial('found');
    const foundAt = new Date(Date.now() - demo.daysAgo * 24 * 60 * 60 * 1000);

    await FoundItem.create({
      serial,
      finderId: finder._id,
      category: demo.category,
      title: demo.title,
      description: demo.description,
      colors: demo.colors,
      brand: demo.brand,
      images: [],
      location: demo.location,
      foundAt,
      custody: demo.custody,
      hiddenDetails: buildHiddenDetail(demo.category),
      status: demo.status,
    });
  }
}