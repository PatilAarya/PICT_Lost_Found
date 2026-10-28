// Shared setup for the verify tests.
import request from 'supertest';
import { createApp } from '../../../app.js';
import { config } from '../../../shared/config/index.js';
import { FoundItem } from '../../../shared/models/FoundItem.js';
import { User } from '../../../shared/models/User.js';

export async function makeTestApp() {
  config.nodeEnv = 'development';
  config.devAuth = true;
  return (await createApp()).app;
}

export async function makePeople() {
  const people = {};
  const cast = [
    ['finder', 'student'],
    ['owner', 'student'],
    ['other', 'student'],
    ['handler', 'handler'],
    ['admin', 'admin'],
  ];
  for (const [key, role] of cast) {
    people[key] = await User.create({ name: key, email: `${key}@pict.edu`, role });
  }
  return people;
}

export function makeItem(finderId, custodyType = 'desk', status = 'in_custody') {
  return FoundItem.create({
    serial: `PICT-F-${String(Math.floor(Math.random() * 900000) + 100000)}`,
    finderId,
    category: 'wallet',
    title: 'Brown leather wallet',
    images: [{ publicUrl: 'https://example.com/blurred.jpg', privateId: 'private/abc', order: 0 }],
    location: { buildingId: 'entrance', floorId: 'g', areaId: 'entrance-gate' },
    custody: {
      type: custodyType,
      deskId: custodyType === 'desk' ? 'security-main-gate' : undefined,
    },
    hiddenDetails: [
      { promptKey: 'cards', promptText: 'Which cards are inside?', answer: 'SBI debit card' },
      { promptKey: 'mark', promptText: 'Any mark on it?', answer: 'Torn corner' },
    ],
    status,
  });
}

export const RIGHT_ANSWERS = [
  { promptKey: 'cards', text: 'sbi debit card' },
  { promptKey: 'mark', text: 'torn corner!' },
];
export const WRONG_ANSWERS = [
  { promptKey: 'cards', text: 'HDFC credit' },
  { promptKey: 'mark', text: 'none' },
];

export function actAs(app, person) {
  return {
    get: (url) => request(app).get(url).set('x-dev-user', person.email),
    post: (url, body) => request(app).post(url).set('x-dev-user', person.email).send(body),
    patch: (url, body) => request(app).patch(url).set('x-dev-user', person.email).send(body),
  };
}
