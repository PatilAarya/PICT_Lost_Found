// Demo found items for development.
import { FoundItem } from '../../shared/models/FoundItem.js';
import { User } from '../../shared/models/User.js';
import { nextSerial } from '../../shared/utils/serial.js';
import { getHiddenDetailPrompts } from './hidden-detail-prompts.js';

const DEMO_ITEMS = [
  {
    finderEmail: 'aarav.sharma@pict.edu',
    category: 'id_card',
    title: 'College ID card',
    description: 'Found near the main entrance, lying on the information desk.',
    colors: ['blue', 'white'],
    brand: '',
    location: { buildingId: 'entrance', floorId: 'g', areaId: 'entrance-gate', x: 0.4, y: 0.5 },
    custody: { type: 'desk', deskId: 'security-main-gate' },
    status: 'posted',
    daysAgo: 0,
  },
  {
    finderEmail: 'priya.kulkarni@pict.edu',
    category: 'phone',
    title: 'Black Android phone',
    description: 'Left on a workbench in Lab A3-101, screen cracked slightly.',
    colors: ['black'],
    brand: 'Samsung',
    location: { buildingId: 'a3', floorId: '1', areaId: 'lab-101', x: 0.5, y: 0.5 },
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
    location: { buildingId: 'a1', floorId: '1', areaId: 'staff-room-1', x: 0.3, y: 0.6 },
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
    location: { buildingId: 'a1', floorId: 'g', areaId: 'central-library', x: 0.6, y: 0.4 },
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
    location: { buildingId: 'canteen', floorId: 'g', areaId: 'canteen-hall', x: 0.5, y: 0.5 },
    custody: { type: 'finder', deskId: '' },
    status: 'posted',
    daysAgo: 3,
  },
  {
    finderEmail: 'ananya.iyer@pict.edu',
    category: 'bag',
    title: 'Grey backpack',
    description: 'Found in the auditorium, has a few notebooks inside.',
    colors: ['grey'],
    brand: '',
    location: { buildingId: 'f', floorId: 'g', areaId: 'auditorium', x: 0.5, y: 0.7 },
    custody: { type: 'desk', deskId: 'admin-office' },
    status: 'posted',
    daysAgo: 0,
  },
];

function buildHiddenDetail(category) {
  const prompts = getHiddenDetailPrompts(category);
  const prompt = prompts[0];
  return [
    {
      promptKey: prompt.promptKey,
      promptText: prompt.promptText,
      answer: 'Demo answer for defense purposes.',
    },
  ];
}

export default async function seed() {
  for (const demo of DEMO_ITEMS) {
    const finder = await User.findOne({ email: demo.finderEmail });
    if (!finder) {
      continue;
    }

    const alreadyExists = await FoundItem.findOne({ finderId: finder._id, title: demo.title });
    if (alreadyExists) {
      continue;
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
