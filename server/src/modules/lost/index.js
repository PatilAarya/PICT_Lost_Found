// The lost module: lost reports, matches and saved items.
import express from 'express';
import { requireAuth } from '../../shared/middleware/requireAuth.js';
import { registerService } from '../../shared/services/registry.js';
import reportRoutes from './routes/reportRoutes.js';
import savedRoutes from './routes/savedRoutes.js';
import photoRoutes from './routes/photoRoutes.js';
import { matchFoundItem } from './services/runMatching.js';

const router = express.Router();
router.use(photoRoutes);
router.use(requireAuth);
router.use(reportRoutes);
router.use(savedRoutes);

export default {
  name: 'lost',
  router,
  async init() {
    registerService('runMatching', matchFoundItem);
  },
};
