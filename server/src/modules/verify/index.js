// The verify module (Member 2): claims, owner check, handover, custody log, analytics.
// Mounted automatically at /api/verify by app.js. Every route needs a logged-in user;
// each routes file adds its own role checks. init() registers the real appendCustody
// service and starts the hourly lifecycle job.
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
  // Called once by server.js after start-up, with Socket.IO and the service registry.
  async init() {
    registerService('appendCustody', appendCustody);
    startJobs();
  },
};
