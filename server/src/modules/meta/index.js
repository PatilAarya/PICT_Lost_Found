// The meta module: sends the locations and desks lists.
import fs from 'node:fs';
import express from 'express';

function readDataFile(fileName) {
  const fileUrl = new URL(`../../shared/data/${fileName}`, import.meta.url);
  return JSON.parse(fs.readFileSync(fileUrl, 'utf8'));
}

const locations = readDataFile('locations.json');
const desks = readDataFile('desks.json');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true });
});

router.get('/locations', (_req, res) => {
  res.json(locations);
});

router.get('/desks', (_req, res) => {
  res.json(desks);
});

export default {
  name: 'meta',
  router,
  async init() {},
};
