// Routes for saved items.
import express from 'express';
import { HttpError } from '../../../shared/utils/httpError.js';
import { SavedItem } from '../models/SavedItem.js';
import { savedItemSchema } from '../schemas.js';

const router = express.Router();

async function findMine(req) {
  const item = await SavedItem.findOne({ _id: req.params.id, userId: req.user._id }).catch(
    () => null
  );
  if (!item) throw new HttpError(404, 'NOT_FOUND', 'This saved item does not exist.');
  return item;
}

router.get('/saved-items', async (req, res) => {
  const items = await SavedItem.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ items });
});

router.post('/saved-items', async (req, res) => {
  const data = savedItemSchema.parse(req.body);
  const item = await SavedItem.create({ ...data, userId: req.user._id });
  res.status(201).json({ item });
});

router.patch('/saved-items/:id', async (req, res) => {
  const item = await findMine(req);
  Object.assign(item, savedItemSchema.parse(req.body));
  await item.save();
  res.json({ item });
});

router.delete('/saved-items/:id', async (req, res) => {
  const item = await findMine(req);
  await item.deleteOne();
  res.json({ ok: true });
});

export default router;
