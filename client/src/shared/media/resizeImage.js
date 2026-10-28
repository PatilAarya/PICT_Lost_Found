// Shrinks a photo in the browser before it gets uploaded, so a 12
// megapixel phone photo does not turn into a slow, expensive upload.
// Draws the image onto a hidden canvas at a smaller size, then reads the
// canvas back out as a compressed JPEG blob. This is plain Canvas maths,
// written by hand on purpose for the client-side scripting course.
export function resizeImage(sourceBlob, maxWidth = 1280, maxHeight = 1280, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(sourceBlob);
    const image = new Image();

    image.onload = () => {
      // Scale down only if the photo is bigger than the limit. Math.min
      // of the two ratios keeps the photo's original aspect ratio.
      const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
      const targetWidth = Math.round(image.width * scale);
      const targetHeight = Math.round(image.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, targetWidth, targetHeight);

      // toBlob is async and gives back a compressed JPEG, much smaller
      // than the canvas's raw pixel data would be.
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
