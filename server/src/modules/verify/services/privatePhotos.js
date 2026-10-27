// Short-lived links to the clear (unblurred) photos, for handlers only.
// The found module uploads originals to Cloudinary as type "authenticated", so they
// cannot be opened without a signature. We sign a download link that expires in
// 10 minutes and never store or return an unsigned private URL.
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

// One signed link that stops working after LINK_SECONDS, or null if not possible.
export function signedPhotoUrl(privateId) {
  if (!isConfigured || !privateId) {
    return null;
  }
  // expires_at is a Unix time in seconds; Cloudinary refuses the link after it.
  const expiresAt = Math.floor(Date.now() / 1000) + LINK_SECONDS;
  return cloudinary.utils.private_download_url(privateId, 'jpg', {
    type: 'authenticated',
    expires_at: expiresAt,
  });
}

// Signed links for every image of an item, in display order.
export function privatePhotos(images) {
  return [...(images || [])]
    .sort((first, second) => first.order - second.order)
    .map((image) => ({ order: image.order, url: signedPhotoUrl(image.privateId) }));
}
