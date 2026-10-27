// A hand-written box blur: for each pixel, replace it with the average
// of every pixel in a square around it. This is not Instagram-quality
// blur, but it is simple enough to explain line by line, which matters
// more for this course than using a built-in CSS filter would.
// CSS "filter: blur()" was deliberately avoided because it blurs only
// what is drawn on screen, not the actual pixel data saved in the file.

// Blurs one rectangle of a canvas in place. rect is in canvas pixel
// coordinates, not CSS display coordinates (see getCanvasPoint below).
export function blurRegion(context, rect, radius = 10) {
  const canvas = context.canvas;
  const x = Math.max(0, Math.round(rect.x));
  const y = Math.max(0, Math.round(rect.y));
  const width = Math.min(canvas.width - x, Math.round(rect.width));
  const height = Math.min(canvas.height - y, Math.round(rect.height));
  if (width <= 0 || height <= 0) return;

  const imageData = context.getImageData(x, y, width, height);
  const blurred = boxBlurPixels(imageData, radius);
  context.putImageData(blurred, x, y);
}

// The actual maths: for every pixel, average the red, green, blue and
// alpha values of every pixel within "radius" pixels of it.
// Cost is roughly width * height * radius^2, so this is kept to small,
// user-chosen rectangles rather than whole photos. A faster version
// (a "sliding window" sum reused between neighbouring pixels) exists,
// but this direct version is easier to read and explain.
function boxBlurPixels(imageData, radius) {
  const { data, width, height } = imageData;
  const output = new Uint8ClampedArray(data.length);

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      let rSum = 0,
        gSum = 0,
        bSum = 0,
        aSum = 0,
        count = 0;

      for (let oy = -radius; oy <= radius; oy++) {
        const sy = py + oy;
        if (sy < 0 || sy >= height) continue;
        for (let ox = -radius; ox <= radius; ox++) {
          const sx = px + ox;
          if (sx < 0 || sx >= width) continue;
          const i = (sy * width + sx) * 4;
          rSum += data[i];
          gSum += data[i + 1];
          bSum += data[i + 2];
          aSum += data[i + 3];
          count += 1;
        }
      }

      const outIndex = (py * width + px) * 4;
      output[outIndex] = rSum / count;
      output[outIndex + 1] = gSum / count;
      output[outIndex + 2] = bSum / count;
      output[outIndex + 3] = aSum / count;
    }
  }

  return new ImageData(output, width, height);
}

// Converts a pointer event's screen position into canvas pixel
// coordinates. This matters because the canvas is often displayed
// smaller on screen than its real pixel size, so a direct
// clientX/clientY would point at the wrong pixel without this scaling.
export function getCanvasPoint(canvas, clientX, clientY) {
  const bounds = canvas.getBoundingClientRect();
  const scaleX = canvas.width / bounds.width;
  const scaleY = canvas.height / bounds.height;
  return {
    x: (clientX - bounds.left) * scaleX,
    y: (clientY - bounds.top) * scaleY,
  };
}
