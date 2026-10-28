// Shrinks a photo in the browser before uploading.
export function resizeImage(sourceBlob, maxWidth = 1280, maxHeight = 1280, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(sourceBlob);
    const image = new Image();

    image.onload = () => {
      const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
      const targetWidth = Math.round(image.width * scale);
      const targetHeight = Math.round(image.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (resizedBlob) => {
          URL.revokeObjectURL(objectUrl);
          if (resizedBlob) {
            resolve(resizedBlob);
          } else {
            reject(new Error('Could not process this photo.'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read this photo.'));
    };

    image.src = objectUrl;
  });
}
