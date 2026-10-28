// Hook that uploads the blurred and original copies of each photo.
import { useState } from 'react';
import { uploadImage } from '../utils/uploadImage.js';

export function useFoundImages() {
  const [uploading, setUploading] = useState(false);

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
