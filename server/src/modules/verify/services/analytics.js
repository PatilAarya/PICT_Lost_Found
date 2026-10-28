// Counts used by the analytics dashboard.
import fs from 'node:fs';
import { Claim } from '../../../shared/models/Claim.js';
import { FoundItem } from '../../../shared/models/FoundItem.js';

const locations = JSON.parse(
  fs.readFileSync(new URL('../../../shared/data/locations.json', import.meta.url), 'utf8')
);
const DAY_MS = 24 * 60 * 60 * 1000;

export function dateMatch(from, to) {
  const range = {};
  if (from) range.$gte = new Date(from);
  if (to) range.$lte = new Date(to);
  return Object.keys(range).length ? { createdAt: range } : {};
}

async function countBy(match, field) {
  const rows = await FoundItem.aggregate([
    { $match: match },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return rows.map((row) => ({ key: row._id || 'unknown', count: row.count }));
}

function buildingName(id) {
  const building = locations.buildings.find((entry) => entry.id === id);
  return building ? building.name : id;
}

export async function byPlace(match) {
  const buildings = await countBy(match, 'location.buildingId');
  const floors = await FoundItem.aggregate([
    { $match: match },
    {
      $group: {
        _id: { building: '$location.buildingId', floor: '$location.floorId' },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);
  return {
    byBuilding: buildings.map((row) => ({ label: buildingName(row.key), count: row.count })),
    byFloor: floors.map((row) => ({
      label: `${buildingName(row._id.building)}, floor ${row._id.floor}`,
      count: row.count,
    })),
  };
}

export async function byHour(match) {
  const rows = await FoundItem.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $hour: { date: { $ifNull: ['$foundAt', '$createdAt'] }, timezone: 'Asia/Kolkata' } },
        count: { $sum: 1 },
      },
    },
  ]);
  const hours = Array.from({ length: 24 }, (_unused, hour) => ({ hour, count: 0 }));
  for (const row of rows) {
    hours[row._id].count = row.count;
  }
  return hours;
}

export async function averageReturnHours(match) {
  const claims = await Claim.find({ status: 'released', releasedAt: { $ne: null } }).select(
    'foundItemId releasedAt'
  );
  const items = await FoundItem.find({
    _id: { $in: claims.map((claim) => claim.foundItemId) },
    ...match,
  }).select('createdAt');
  const createdById = new Map(items.map((item) => [String(item._id), item.createdAt]));
  const hours = claims
    .filter((claim) => createdById.has(String(claim.foundItemId)))
    .map((claim) => (claim.releasedAt - createdById.get(String(claim.foundItemId))) / 3600000);
  if (hours.length === 0) return 0;
  return Number((hours.reduce((sum, value) => sum + value, 0) / hours.length).toFixed(1));
}

export async function buildDashboard(from, to) {
  const match = dateMatch(from, to);
  const place = await byPlace(match);
  return {
    ...place,
    byHour: await byHour(match),
    byCategory: (await countBy(match, 'category')).map((row) => ({
      label: row.key,
      count: row.count,
    })),
    averageReturnHours: await averageReturnHours(match),
    claimsWaiting: await Claim.countDocuments({ status: 'awaiting_handler' }),
    releasedThisWeek: await Claim.countDocuments({
      status: 'released',
      releasedAt: { $gte: new Date(Date.now() - 7 * DAY_MS) },
    }),
    totalItems: await FoundItem.countDocuments(match),
  };
}
