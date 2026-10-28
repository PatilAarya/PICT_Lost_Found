// Sample data used only by the dev gallery.
import { CLAIM_STATUS, FOUND_STATUS, LOST_STATUS } from '../../shared/constants.js';

export const ALL_STATUSES = [
  ...new Set([...FOUND_STATUS, ...LOST_STATUS, ...CLAIM_STATUS, 'warned', 'suspended']),
];

const samplePhoto =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56">' +
      '<rect width="56" height="56" fill="#a8dadc"/>' +
      '<rect x="18" y="8" width="20" height="40" rx="4" fill="#1d3557"/>' +
      '<rect x="21" y="13" width="14" height="28" fill="#457b9d"/></svg>'
  );

export const SAMPLE_TICKETS = [
  {
    kind: 'lost',
    serial: 'PICT-L-000045',
    category: 'bottle',
    title: 'Steel water bottle, blue',
    status: 'matched',
    locationLabel: 'Building A, first floor, Lab 2',
    timeLabel: 'Lost 27 Oct, 10:00 to 12:30',
  },
  {
    kind: 'found',
    serial: 'PICT-F-000123',
    category: 'phone',
    title: 'Black phone with a cracked corner',
    status: 'in_custody',
    locationLabel: 'Building B, ground floor, canteen',
    timeLabel: 'Found 27 Oct, 13:15',
    imageUrl: samplePhoto,
  },
  {
    kind: 'found',
    serial: 'PICT-F-000124',
    category: 'id_card',
    title: 'College ID card, Computer department',
    status: 'released',
    locationLabel: 'Building A, ground floor, entrance',
    timeLabel: 'Found 26 Oct, 09:40',
  },
];

export const SAMPLE_TIMELINE = [
  { label: 'Posted', done: true, at: '27 Oct, 13:15' },
  { label: 'At the security desk', done: true, at: '27 Oct, 13:40' },
  { label: 'Claim checked', done: false },
  { label: 'Released to owner', done: false },
];

export const SAMPLE_STEPS = ['Category', 'Details', 'Where', 'When', 'Review'];
