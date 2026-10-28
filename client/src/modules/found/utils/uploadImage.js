// Uploads one photo and returns its id and URL.
import { api } from '../../../shared/api/client.js';

const UPLOAD_ERROR = 'Could not upload this photo. Check your connection and try again.';

async function uploadToCloudinary(blob, sign) {
  const formData = new FormData();
  formData.append('file', blob);
  formData.append('api_key', sign.apiKey);
  formData.append('timestamp', sign.timestamp);
  formData.append('signature', sign.signature);
  formData.append('folder', sign.folder);
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

async function uploadToServer(blob, kind) {
  const formData = new FormData();
  formData.append('file', blob, 'photo.jpg');
  const response = await api.post('/found/images/local', formData, { params: { kind } });
  return response.data;
}

export async function uploadImage(blob, kind) {
  const signResponse = await api.post('/found/images', { kind });
  const sign = signResponse.data;
  if (sign.mode === 'local') {
    return uploadToServer(blob, kind);
  }
  return uploadToCloudinary(blob, sign);
}
