// The lost module (Member 1): lost reports, matches and saved items.
// Mounted automatically at /api/lost by app.js. Phase 0 leaves it empty.
// In init(), register the real runMatching with registerService('runMatching', fn).
import express from 'express';

const router = express.Router();

export default {
  name: 'lost',
  router,
  // Called once by server.js after start-up, with Socket.IO and the service registry.
  async init() {},
};
