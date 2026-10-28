// Takes the finder's confirmed photos (each with a public blurred blob
// and a private original blob) and uploads both copies of every photo,
// returning the final images[] array in the shape FoundItem expects.
import { useState } from 'react';
import { uploadImage } from '../utils/uploadImage.js';

export function useFoundImages() {
  const [uploading, setUploading] = useState(false);

  // Uploads every photo's two copies in order and builds the images
  // array the server's createItemSchema expects: publicUrl + privateId.
  async function uploadAll(confirmedPhotos) {
    setUploading(true);
    try {
      const images = [];
      for (let i = 0; i < confirmedPhotos.length; i++) {
        const { publicBlob, privateBlob } = confirmedPhotos[i];
        const [publicResult, privateResult] = await Promise.all([
          uploadImage(publicBlob, 'public'),
          uploadImage(privateBlob, 'private'),
        ]);
        images.push({
          publicUrl: publicResult.secureUrl,
          privateId: privateResult.publicId,
          order: i,
        });
      }
      return images;
    } finally {
      setUploading(false);
    }
  }

  return { uploadAll, uploading };
}
