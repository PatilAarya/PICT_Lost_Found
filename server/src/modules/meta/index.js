// The meta module: public, read-only reference data for the client.
// GET /api/meta/locations returns buildings, floors and areas (locations.json).
// GET /api/meta/desks returns the drop-off desks (desks.json).
// No login needed, because the login page and pickers need it too.
import fs from 'node:fs';
import express from 'express';

// Read a JSON file from shared/data once, at start-up.
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
  // Nothing to set up: meta has no services or socket events.
  async init() {},
};
