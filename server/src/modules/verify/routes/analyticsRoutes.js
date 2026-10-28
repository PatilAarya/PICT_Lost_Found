// Route for the analytics numbers.
import express from 'express';
import { z } from 'zod';
import { requireRole } from '../../../shared/middleware/requireRole.js';
import { STAFF_ROLES } from '../services/access.js';
import { buildDashboard } from '../services/analytics.js';

const router = express.Router();
const rangeSchema = z.object({ from: z.iso.date().optional(), to: z.iso.date().optional() });

router.get('/analytics', requireRole(...STAFF_ROLES), async (req, res) => {
  const { from, to } = rangeSchema.parse(req.query);
  res.json(await buildDashboard(from, to ? `${to}T23:59:59.999Z` : undefined));
});

export default router;
