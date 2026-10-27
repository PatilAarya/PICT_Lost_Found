// Uploads one photo straight from the browser to Cloudinary, using a
// short-lived signature our own server generated. The raw file never
// passes through our Express server, which keeps uploads fast and keeps
// Cloudinary's secret key off the browser entirely.
import { api } from '../../../shared/api/client.js';

// Gets a signature from our server, then uploads the blob to Cloudinary
// and returns what Cloudinary sent back (publicId, secureUrl).
export async function uploadImage(blob, kind) {
  const signResponse = await api.post('/found/images', { kind });
  const sign = signResponse.data;

  const formData = new FormData();
  formData.append('file', blob);
  formData.append('api_key', sign.apiKey);
  formData.append('timestamp', sign.timestamp);
  formData.append('signature', sign.signature);
  formData.append('folder', sign.folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );
  if (!response.ok) {
    throw new Error('Could not upload this photo. Check your connection and try again.');
  }
  const result = await response.json();
  return { publicId: result.public_id, secureUrl: result.secure_url };
}