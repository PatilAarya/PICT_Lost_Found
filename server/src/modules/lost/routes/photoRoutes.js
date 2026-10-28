// Routes for the optional photo on a lost report.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import multer from 'multer';
import { nanoid } from 'nanoid';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../../../shared/config/index.js';
import { requireAuth } from '../../../shared/middleware/requireAuth.js';
import { HttpError } from '../../../shared/utils/httpError.js';

const router = express.Router();
const photosDir = fileURLToPath(new URL('../../../../uploads/lost/', import.meta.url));
const isCloudinaryOn = Boolean(config.cloudinary.cloudName && config.cloudinary.apiKey);

if (isCloudinaryOn) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
}

const readPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'pict-lost-found/lost-reports' },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });
}

async function saveOnServer(buffer) {
  await fs.mkdir(photosDir, { recursive: true });
  const name = `${nanoid()}.jpg`;
  await fs.writeFile(path.join(photosDir, name), buffer);
  return `/api/lost/photos/files/${name}`;
}

router.use('/photos/files', express.static(photosDir));

router.post('/photos', requireAuth, readPhoto.single('file'), async (req, res) => {
  if (!req.file) {
    throw new HttpError(400, 'NO_PHOTO', 'Choose a photo to upload.');
  }
  const url = isCloudinaryOn
    ? await uploadToCloudinary(req.file.buffer)
    : await saveOnServer(req.file.buffer);
  res.status(201).json({ url });
});

export default router;
