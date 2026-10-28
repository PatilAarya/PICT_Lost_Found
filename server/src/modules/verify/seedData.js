// Plan for the verify demo data.
import fs from 'node:fs';
import { CATEGORIES } from '../../shared/constants.js';

const locations = JSON.parse(
  fs.readFileSync(new URL('../../shared/data/locations.json', import.meta.url), 'utf8')
);

export const ITEM_COUNT = 40;
export const DEMO_CODE = '246810';
const HOUR_MS = 60 * 60 * 1000;

const DETAILS = {
  id_card: [
    ['initials', 'What initials are on the card?', 'A S'],
    ['lanyard', 'Colour of the lanyard?', 'blue'],
  ],
  phone: [
    ['wallpaper', 'What is on the lock screen?', 'a temple at sunset'],
    ['case', 'Describe the case', 'black with a crack at the top'],
  ],
  laptop: [
    ['sticker', 'Which sticker is on the lid?', 'GDG Pune'],
    ['charger', 'What is in the sleeve?', 'a white charger'],
  ],
  wallet: [
    ['cards', 'Which cards are inside?', 'SBI debit card'],
    ['photo', 'Is there a photo inside?', 'my grandmother'],
  ],
  keys: [
    ['keychain', 'Describe the keychain', 'a small Ganpati idol'],
    ['count', 'How many keys?', '3'],
  ],
  bottle: [
    ['brand', 'Brand of the bottle?', 'Milton'],
    ['sticker', 'Any sticker on it?', 'a cat sticker'],
  ],
  bag: [
    ['inside', 'Name one thing inside', 'DBMS notebook'],
    ['tag', 'What is on the tag?', 'Roll 31'],
  ],
  earbuds: [
    ['brand', 'Brand of the earbuds?', 'boAt'],
    ['case', 'Any mark on the case?', 'scratch near the hinge'],
  ],
  books: [
    ['title', 'Title of the book?', 'Operating System Concepts'],
    ['name', 'Name written inside?', 'Sneha'],
  ],
  other: [
    ['describe', 'Describe the item', 'blue umbrella'],
    ['mark', 'Any mark on it?', 'broken spoke'],
  ],
};

function allPlaces() {
  const places = [];
  for (const building of locations.buildings) {
    for (const floor of building.floors) {
      for (const area of floor.areas) {
        places.push({ buildingId: building.id, floorId: floor.id, areaId: area.id });
      }
    }
  }
  return places;
}

function storyOf(index, custodyType) {
  if (index <= 6) return 'released';
  if (index <= 8) return 'awaiting';
  if (index === 9) return 'approved';
  if (index === 10) return 'rejected';
  if (custodyType === 'finder') return 'kept_by_finder';
  if (index <= 12) return 'incoming';
  return index <= 14 ? 'at_desk' : 'moved_to_admin';
}

export function itemPlan(index, now) {
  const places = allPlaces();
  const category = CATEGORIES[index % CATEGORIES.length];
  const custodyType = index > 10 && index % 4 === 0 ? 'finder' : 'desk';
  const createdAt = new Date(now.getTime() - index * 17 * HOUR_MS);
  const foundAt = new Date(createdAt.getTime() - ((index * 7) % 10) * HOUR_MS);
  return {
    index,
    serial: `PICT-F-${String(900000 + index)}`,
    category,
    title: `${category.replace('_', ' ')} (demo ${index})`,
    location: places[index % places.length],
    custodyType,
    createdAt,
    foundAt,
    story: storyOf(index, custodyType),
    hiddenDetails: DETAILS[category].map(([promptKey, promptText, answer]) => ({
      promptKey,
      promptText,
      answer,
    })),
  };
}

export const STATUS_BY_STORY = {
  released: 'released',
  awaiting: 'claim_pending',
  approved: 'verified',
  rejected: 'in_custody',
  kept_by_finder: 'posted',
  incoming: 'posted',
  at_desk: 'in_custody',
  moved_to_admin: 'transferred_admin',
};

export function custodySteps(story) {
  if (story === 'kept_by_finder') return [['POSTED', 0]];
  if (story === 'incoming')
    return [
      ['POSTED', 0],
      ['DROPPED_AT_DESK', 0.5],
    ];
  const steps = [
    ['POSTED', 0],
    ['DROPPED_AT_DESK', 0.5],
    ['RECEIVED_BY_HANDLER', 1],
    ['STORED', 1.1],
  ];
  if (story === 'moved_to_admin') steps.push(['TRANSFERRED_TO_ADMIN', 25]);
  return steps;
}
