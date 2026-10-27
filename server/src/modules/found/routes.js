// HTTP routes for the found module: post a found item, list items, read
// one item, get a signed Cloudinary upload, and get a desk suggestion.
// Mounted at /api/found by app.js. See docs/CONTRACT.md section E.
import express from 'express';
import { z } from 'zod';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../../shared/config/index.js';
import { requireAuth } from '../../shared/middleware/requireAuth.js';
import { HttpError, readPagination } from '../../shared/utils/httpError.js';
import { nextSerial } from '../../shared/utils/serial.js';
import { services } from '../../shared/services/registry.js';
import { FoundItem } from '../../shared/models/FoundItem.js';
import { CATEGORIES, COLORS } from '../../shared/constants.js';
import { suggestDesk, listDesks } from './desk-suggestion.js';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

const router = express.Router();

// Shapes the request body for creating a found item must match. zod
// throws a readable error itself if the shape is wrong.
const createItemSchema = z.object({
  category: z.enum(CATEGORIES),
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).optional(),
  colors: z.array(z.enum(COLORS)).optional(),
  brand: z.string().trim().max(60).optional(),
  images: z
    .array(
      z.object({
        publicUrl: z.string().url(),
        privateId: z.string().min(1),
        order: z.number().int().optional(),
      })
    )
    .optional(),
  location: z.object({
    buildingId: z.string().min(1),
    floorId: z.string().min(1),
    areaId: z.string().optional(),
    x: z.number().min(0).max(1).optional(),
    y: z.number().min(0).max(1).optional(),
  }),
  foundAt: z.coerce.date(),
  custody: z.object({
    type: z.enum(['desk', 'finder']),
    deskId: z.string().optional(),
  }),
  hiddenDetails: z
    .array(
      z.object({
        promptKey: z.string().min(1),
        promptText: z.string().min(1),
        answer: z.string().trim().min(1),
      })
    )
    .min(1, 'Add at least one hidden detail before posting.'),
});

// POST /api/found/items — post a newly found item.
router.post('/items', requireAuth, async (req, res) => {
  const data = createItemSchema.parse(req.body);
  const serial = await nextSerial('found');

  const item = await FoundItem.create({
    ...data,
    serial,
    finderId: req.user._id,
  });

  // Tell the lost module to look for matching lost reports. This never
  // throws even if matching fails internally; the stub/real function is
  // responsible for its own error handling.
  await services.runMatching({ foundItemId: item._id });

  res.status(201).json({ item });
});

// GET /api/found/items — list found items. Defaults to the caller's own
// items ("my found items"); a handler can pass ?all=true to see everyone's.
router.get('/items', requireAuth, async (req, res) => {
  const { page, limit, skip } = readPagination(req.query);
  const filter = {};

  const wantsAll = req.query.all === 'true' && ['handler', 'admin'].includes(req.user.role);
  if (!wantsAll) {
    filter.finderId = req.user._id;
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const [items, total] = await Promise.all([
    FoundItem.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    FoundItem.countDocuments(filter),
  ]);

  res.json({ items, page, limit, total });
});

// GET /api/found/items/:id — read one found item. Hidden-detail answers
// are never included here; only handler-only routes in Verify may ask
// for them explicitly with .select('+hiddenDetails.answer').
router.get('/items/:id', requireAuth, async (req, res) => {
  const item = await FoundItem.findById(req.params.id);
  if (!item) {
    throw new HttpError(404, 'NOT_FOUND', 'This found item does not exist.');
  }
  res.json({ item });
});

// POST /api/found/images — return a signed payload for a direct browser
// upload to Cloudinary. kind decides the folder: "public" photos are
// shown to everyone, "private" photos (the unblurred originals) are
// uploaded too, but their id is never sent back by any route except
// ones a handler calls, which is how this project keeps them hidden.
router.post('/images', requireAuth, (req, res) => {
  const kind = req.body?.kind === 'private' ? 'private' : 'public';
  const folder = `pict-lost-found/found-items-${kind}`;
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    config.cloudinary.apiSecret
  );

  res.json({
    timestamp,
    folder,
    signature,
    apiKey: config.cloudinary.apiKey,
    cloudName: config.cloudinary.cloudName,
  });
});

// GET /api/found/desks/suggest — suggest the nearest desk for a location.
router.get('/desks/suggest', requireAuth, (req, res) => {
  const { buildingId, floorId } = req.query;
  if (!buildingId || !floorId) {
    throw new HttpError(400, 'BAD_REQUEST', 'Pass buildingId and floorId to get a suggestion.');
  }
  const desk = suggestDesk({ buildingId, floorId });
  res.json({ desk, allDesks: listDesks() });
});

// GET /api/found/hidden-detail-prompts?category=... — the secret
// question list for a category, used by the "post found item" form.
router.get('/hidden-detail-prompts', requireAuth, (req, res) => {
  const prompts = services.getHiddenDetailPrompts(req.query.category);
  res.json({ prompts });
});

export default router;