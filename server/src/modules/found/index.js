// The found module (Member 3): found items, image upload and desk suggestion.
// Mounted automatically at /api/found by app.js. Phase 0 leaves it empty.
// In init(), register getHiddenDetailPrompts with registerService(...).
import express from 'express';

const router = express.Router();

export default {
  name: 'found',
  router,
  // Called once by server.js after start-up, with Socket.IO and the service registry.
  async init() {},
};
