// Uploads one photo and returns { publicId, secureUrl }.
// The server decides where photos go (imageRoutes.js on the server):
// - "cloudinary": the browser sends the file straight to Cloudinary with a short-lived
//   signature from our server, so the secret key never reaches the browser.
// - "local": no Cloudinary account is set up, so the file goes to our own server.
import { api } from '../../../shared/api/client.js';

const UPLOAD_ERROR = 'Could not upload this photo. Check your connection and try again.';

// Send the blob to Cloudinary using the signed fields our server gave us.
async function uploadToCloudinary(blob, sign) {
  const formData = new FormData();
  formData.append('file', blob);
  formData.append('api_key', sign.apiKey);
  formData.append('timestamp', sign.timestamp);
  formData.append('signature', sign.signature);
  formData.append('folder', sign.folder);
  // Private originals are "authenticated": nobody can open them without a signed link.
  if (sign.type) {
    formData.append('type', sign.type);
  }
  const response = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error(UPLOAD_ERROR);
  }
  const result = await response.json();
  return { publicId: result.public_id, secureUrl: result.secure_url };
}

// Send the blob to our own server, which keeps it in server/uploads.
async function uploadToServer(blob, kind) {
  const formData = new FormData();
  formData.append('file', blob, 'photo.jpg');
  const response = await api.post('/found/images/local', formData, { params: { kind } });
  return response.data;
}

// Upload one photo; kind is "public" (blurred copy) or "private" (clear original).
export async function uploadImage(blob, kind) {
  const signResponse = await api.post('/found/images', { kind });
  const sign = signResponse.data;
  if (sign.mode === 'local') {
    return uploadToServer(blob, kind);
  }
  return uploadToCloudinary(blob, sign);
}
