// The shapes request bodies must have, checked with zod. Routes call schema.parse(req.body);
// a wrong shape throws, and errorHandler turns it into a 400 { error: { code, message } }.
// Kept together so the rules for lost reports and saved items are easy to find.
import { z } from 'zod';
import { CATEGORIES, COLORS } from '../../shared/constants.js';

const locationSchema = z.object({
  buildingId: z.string().min(1),
  floorId: z.string().min(1),
  areaId: z.string().optional(),
  x: z.number().min(0).max(1).optional(),
  y: z.number().min(0).max(1).optional(),
});

export const reportSchema = z
  .object({
    category: z.enum(CATEGORIES),
    title: z.string().trim().min(1, 'Give the item a short name.').max(80),
    description: z.string().trim().max(500).optional(),
    colors: z.array(z.enum(COLORS)).optional(),
    brand: z.string().trim().max(60).optional(),
    lastSeen: locationSchema,
    lostFrom: z.coerce.date(),
    lostTo: z.coerce.date(),
    savedItemId: z.string().optional(),
    // When true, the item is also kept as a saved item for next time.
    saveForLater: z.boolean().optional(),
  })
  .refine((body) => body.lostTo >= body.lostFrom, {
    message: 'The "to" time must be after the "from" time.',
    path: ['lostTo'],
  });

export const savedItemSchema = z.object({
  label: z.string().trim().min(1, 'Give it a name, for example "My water bottle".').max(60),
  category: z.enum(CATEGORIES),
  colors: z.array(z.enum(COLORS)).optional(),
  brand: z.string().trim().max(60).optional(),
  description: z.string().trim().max(500).optional(),
  stickers: z.string().trim().max(200).optional(),
});
