// Analytics route for the dashboard (handlers and admins).
// GET /analytics?from=2026-10-01&to=2026-10-31 returns every chart's numbers at once:
// by building, by floor, by hour, by category, average return time, claims waiting,
// and items released this week. The maths is in services/analytics.js.
import express from 'express';
import { z } from 'zod';
import { requireRole } from '../../../shared/middleware/requireRole.js';
import { STAFF_ROLES } from '../services/access.js';
import { buildDashboard } from '../services/analytics.js';

const router = express.Router();
// z.iso.date() accepts only YYYY-MM-DD, so a bad date gives a clear 400 error.
const rangeSchema = z.object({ from: z.iso.date().optional(), to: z.iso.date().optional() });

router.get('/analytics', requireRole(...STAFF_ROLES), async (req, res) => {
  const { from, to } = rangeSchema.parse(req.query);
  res.json(await buildDashboard(from, to ? `${to}T23:59:59.999Z` : undefined));
});

export default router;
