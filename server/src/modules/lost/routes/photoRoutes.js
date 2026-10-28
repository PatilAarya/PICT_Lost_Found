// The optional photo on a lost report ("this is what my bottle looks like").
//   POST /photos               upload one photo (form field "file"), returns { url }
//   GET  /photos/files/<name>  the saved photo, when stored on this server
// With CLOUDINARY_* set, the photo goes to Cloudinary; without it, it is saved in
// server/uploads/lost with a long random name nobody can guess. Lost reports are only
// shown to their owner and the desk, so the photo URL is only ever shown to them too.
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

// multer keeps the uploaded file in memory (req.file.buffer); 5 MB is plenty after
// the browser has already shrunk it with resizeImage.
const readPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Send the photo bytes to Cloudinary and return its https address.
function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'pict-lost-found/lost-reports' },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });
}

// Save the photo bytes in server/uploads/lost and return the address that serves it.
async function saveOnServer(buffer) {
  await fs.mkdir(photosDir, { recursive: true });
  const name = `${nanoid()}.jpg`;
  await fs.writeFile(path.join(photosDir, name), buffer);
  return `/api/lost/photos/files/${name}`;
}

// Photos are read by <img> tags, which cannot send the dev login header, so this one route
// is public; the random file names are what keep the photos private.
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
