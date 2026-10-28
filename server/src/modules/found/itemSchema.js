// The shape a "post found item" request body must have, checked with zod.
// routes.js calls createItemSchema.parse(req.body); a wrong shape throws a readable
// error that errorHandler turns into { error: { code, message } }.
// Kept in its own file so routes.js stays short and the rules are easy to find.
import { z } from 'zod';
import { CATEGORIES, COLORS } from '../../shared/constants.js';

// The owner check needs at least two secrets to be fair (DESIGN brief, Found step 4).
export const MIN_HIDDEN_DETAILS = 2;

const imageSchema = z.object({
  // A Cloudinary https link, or /api/found/files/... when photos are stored locally.
  publicUrl: z.string().min(1),
  privateId: z.string().min(1),
  order: z.number().int().optional(),
});

const locationSchema = z.object({
  buildingId: z.string().min(1),
  floorId: z.string().min(1),
  areaId: z.string().optional(),
  x: z.number().min(0).max(1).optional(),
  y: z.number().min(0).max(1).optional(),
});

const hiddenDetailSchema = z.object({
  promptKey: z.string().min(1),
  promptText: z.string().min(1),
  answer: z.string().trim().min(1),
});

export const createItemSchema = z.object({
  category: z.enum(CATEGORIES),
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).optional(),
  colors: z.array(z.enum(COLORS)).optional(),
  brand: z.string().trim().max(60).optional(),
  images: z.array(imageSchema).optional(),
  location: locationSchema,
  foundAt: z.coerce.date(),
  custody: z.object({
    type: z.enum(['desk', 'finder']),
    deskId: z.string().optional(),
  }),
  hiddenDetails: z
    .array(hiddenDetailSchema)
    .min(MIN_HIDDEN_DETAILS, 'Answer at least two secret questions before posting.'),
  // The colour guess from the photo, kept apart from the colours the finder confirmed.
  aiSuggestion: z
    .object({
      category: z.string().optional(),
      colors: z.array(z.string()).optional(),
      confidence: z.number().optional(),
    })
    .optional(),
});
