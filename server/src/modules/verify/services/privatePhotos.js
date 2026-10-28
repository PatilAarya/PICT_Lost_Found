// Short-lived links to clear photos for handlers.
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../../../shared/config/index.js';

const LINK_SECONDS = 10 * 60;
const isConfigured = Boolean(config.cloudinary.cloudName && config.cloudinary.apiKey);

if (isConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
}

export function signedPhotoUrl(privateId) {
  if (!isConfigured || !privateId) {
    return null;
  }
  const expiresAt = Math.floor(Date.now() / 1000) + LINK_SECONDS;
  return cloudinary.utils.private_download_url(privateId, 'jpg', {
    type: 'authenticated',
    expires_at: expiresAt,
  });
}

export function privatePhotos(images) {
  return [...(images || [])]
    .sort((first, second) => first.order - second.order)
    .map((image) => ({ order: image.order, url: signedPhotoUrl(image.privateId) }));
}
