// The lost module (Member 1): lost reports, matches and saved items.
// Mounted automatically at /api/lost by app.js. Every route needs a logged-in user, except
// the photo files themselves (see routes/photoRoutes.js for why).
// init() registers the real runMatching, so the Found module's call
// services.runMatching({ foundItemId }) now compares the new item with open lost reports.
import express from 'express';
import { requireAuth } from '../../shared/middleware/requireAuth.js';
import { registerService } from '../../shared/services/registry.js';
import reportRoutes from './routes/reportRoutes.js';
import savedRoutes from './routes/savedRoutes.js';
import photoRoutes from './routes/photoRoutes.js';
import { matchFoundItem } from './services/runMatching.js';

const router = express.Router();
// Photo routes come first: the photo files are served before the login check below.
router.use(photoRoutes);
router.use(requireAuth);
router.use(reportRoutes);
router.use(savedRoutes);

export default {
  name: 'lost',
  router,
  // Called once by server.js after start-up, with Socket.IO and the service registry.
  async init() {
    registerService('runMatching', matchFoundItem);
  },
};
