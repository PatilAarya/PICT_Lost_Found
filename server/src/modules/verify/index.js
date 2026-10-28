// The verify module: claims, ownership check and handover.
import express from 'express';
import { requireAuth } from '../../shared/middleware/requireAuth.js';
import { registerService } from '../../shared/services/registry.js';
import { appendCustody } from './services/custodyChain.js';
import { startJobs } from './jobs.js';
import custodyRoutes from './routes/custodyRoutes.js';
import claimRoutes from './routes/claimRoutes.js';
import deskRoutes from './routes/deskRoutes.js';
import handoverRoutes from './routes/handoverRoutes.js';
import flagRoutes from './routes/flagRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

const router = express.Router();
router.use(requireAuth);
router.use(custodyRoutes);
router.use(claimRoutes);
router.use(deskRoutes);
router.use(handoverRoutes);
router.use(flagRoutes);
router.use(analyticsRoutes);

export default {
  name: 'verify',
  router,
  async init() {
    registerService('appendCustody', appendCustody);
    startJobs();
  },
};
