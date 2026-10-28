// Simple box blur that blurs a chosen area of a photo.
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

export function getCanvasPoint(canvas, clientX, clientY) {
  const bounds = canvas.getBoundingClientRect();
  const scaleX = canvas.width / bounds.width;
  const scaleY = canvas.height / bounds.height;
  return {
    x: (clientX - bounds.left) * scaleX,
    y: (clientY - bounds.top) * scaleY,
  };
}
