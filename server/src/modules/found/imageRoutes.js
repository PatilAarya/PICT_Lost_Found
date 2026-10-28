// Photo upload routes for found items. Two ways to store a photo:
// 1. Cloudinary (when CLOUDINARY_* is set in .env): the browser uploads straight to
//    Cloudinary with a signature from POST /images. Private originals use type
//    "authenticated", so they cannot be opened without a signed link (verify module).
// 2. Local folder (no Cloudinary account): POST /images/local saves the file in
//    server/uploads. Only public (blurred) copies are ever served, from GET /files/<name>.
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

// multer does not create folders itself, so make sure both exist when the server starts.
fs.mkdirSync(path.join(uploadsDir, 'public'), { recursive: true });
fs.mkdirSync(path.join(uploadsDir, 'private'), { recursive: true });

if (isCloudinaryOn) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
}

// "public" or "private", from the request; anything else counts as public.
function kindOf(value) {
  return value === 'private' ? 'private' : 'public';
}

// POST /api/found/images — how the browser should upload one photo.
router.post('/images', requireAuth, (req, res) => {
  if (!isCloudinaryOn) {
    res.json({ mode: 'local' });
    return;
  }
  const kind = kindOf(req.body?.kind);
  const folder = `pict-lost-found/found-items-${kind}`;
  const timestamp = Math.round(Date.now() / 1000);
  // Every extra field the browser sends must be part of the signature, or Cloudinary refuses.
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

// multer reads the "file" field of a multipart form and writes it to disk.
// The folder comes from ?kind, and the name is random so nobody can guess it.
const saveToDisk = multer({
  storage: multer.diskStorage({
    destination: (req, _file, done) => done(null, path.join(uploadsDir, kindOf(req.query.kind))),
    filename: (_req, _file, done) => done(null, `${nanoid()}.jpg`),
  }),
  limits: { fileSize: MAX_PHOTO_BYTES },
});

// POST /api/found/images/local?kind=public|private — keep one photo on this server.
router.post('/images/local', requireAuth, saveToDisk.single('file'), (req, res) => {
  const kind = kindOf(req.query.kind);
  const name = req.file.filename;
  res.status(201).json({
    publicId: `local:${kind}/${name}`,
    secureUrl: kind === 'public' ? `/api/found/files/${name}` : null,
  });
});

// GET /api/found/files/<name> — the blurred public copies only; private files are never served.
router.use('/files', express.static(path.join(uploadsDir, 'public')));

export default router;
