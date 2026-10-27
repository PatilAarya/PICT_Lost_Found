// The notifications module (Member 1): list, mark read, unread count, live updates.
// Mounted automatically at /api/notifications by app.js. Phase 0 leaves it empty.
// In init(), register the real notify with registerService('notify', fn) and send
// live updates with io.to(userRoom(userId)).emit('notification', doc).
import express from 'express';

const router = express.Router();

export default {
  name: 'notifications',
  router,
  // Called once by server.js after start-up, with Socket.IO and the service registry.
  async init() {},
};
