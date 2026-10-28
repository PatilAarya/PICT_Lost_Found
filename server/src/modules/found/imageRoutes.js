// Routes for uploading found item photos.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import multer from 'multer';
import { nanoid } from 'nanoid';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../../shared/config/index.js';
import { requireAuth } from '../../shared/middleware/requireAuth.js';

const router = express.Router();
const isCloudinaryOn = Boolean(config.cloudinary.cloudName && config.cloudinary.apiKey);
const uploadsDir = fileURLToPath(new URL('../../../uploads/', import.meta.url));
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

fs.mkdirSync(path.join(uploadsDir, 'public'), { recursive: true });
fs.mkdirSync(path.join(uploadsDir, 'private'), { recursive: true });

if (isCloudinaryOn) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
}

function kindOf(value) {
  return value === 'private' ? 'private' : 'public';
}

router.post('/images', requireAuth, (req, res) => {
  if (!isCloudinaryOn) {
    res.json({ mode: 'local' });
    return;
  }
  const kind = kindOf(req.body?.kind);
  const folder = `pict-lost-found/found-items-${kind}`;
  const timestamp = Math.round(Date.now() / 1000);
  const params =
    kind === 'private' ? { timestamp, folder, type: 'authenticated' } : { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(params, config.cloudinary.apiSecret);
  res.json({
    mode: 'cloudinary',
    ...params,
    signature,
    apiKey: config.cloudinary.apiKey,
    cloudName: config.cloudinary.cloudName,
  });
});

const saveToDisk = multer({
  storage: multer.diskStorage({
    destination: (req, _file, done) => done(null, path.join(uploadsDir, kindOf(req.query.kind))),
    filename: (_req, _file, done) => done(null, `${nanoid()}.jpg`),
  }),
  limits: { fileSize: MAX_PHOTO_BYTES },
});

router.post('/images/local', requireAuth, saveToDisk.single('file'), (req, res) => {
  const kind = kindOf(req.query.kind);
  const name = req.file.filename;
  res.status(201).json({
    publicId: `local:${kind}/${name}`,
    secureUrl: kind === 'public' ? `/api/found/files/${name}` : null,
  });
});

router.use('/files', express.static(path.join(uploadsDir, 'public')));

export default router;
