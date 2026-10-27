// Lets the finder drag a rectangle over a sensitive part of one photo
// (a phone screen, an ID number) and blurs it permanently into the
// image before it is posted publicly. Uses Pointer Events directly,
// which work the same for a mouse and a finger on a touchscreen.
import { useEffect, useRef, useState } from 'react';
import { blurRegion, getCanvasPoint } from '../utils/blurRegions.js';
import { Button } from '../../../shared/ui/index.js';
import './PhotoBlurEditor.css';

export default function PhotoBlurEditor({ photo, onConfirm }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [dragStart, setDragStart] = useState(null);
  const [dragRect, setDragRect] = useState(null);
  const [hasBlur, setHasBlur] = useState(false);

  // Draw the original photo onto the canvas once, at its full captured
  // size, the first time this photo is edited.
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const image = new Image();
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);
      imageRef.current = image;
    };
    image.src = photo.previewUrl;
  }, [photo.previewUrl]);

  // Starts tracking a drag. pointerId lets us ignore a second finger if
  // someone touches the screen with two fingers at once.
  function handlePointerDown(event) {
    event.target.setPointerCapture(event.pointerId);
    const point = getCanvasPoint(canvasRef.current, event.clientX, event.clientY);
    setDragStart(point);
    setDragRect({ x: point.x, y: point.y, width: 0, height: 0 });
  }

  // Updates the live selection rectangle while the finder drags.
  function handlePointerMove(event) {
    if (!dragStart) return;
    const point = getCanvasPoint(canvasRef.current, event.clientX, event.clientY);
    setDragRect({
      x: Math.min(dragStart.x, point.x),
      y: Math.min(dragStart.y, point.y),
      width: Math.abs(point.x - dragStart.x),
      height: Math.abs(point.y - dragStart.y),
    });
  }

  // On release, bake the blur permanently into the canvas pixels.
  function handlePointerUp() {
    if (dragRect && dragRect.width > 4 && dragRect.height > 4) {
      blurRegion(canvasRef.current.getContext('2d'), dragRect, 12);
      setHasBlur(true);
    }
    setDragStart(null);
    setDragRect(null);
  }

  // Redraws the original photo, wiping out every blur applied so far.
  function startOver() {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.drawImage(imageRef.current, 0, 0);
    setHasBlur(false);
  }

  // Reads the finished canvas back out as a file and hands it to the
  // parent step, which uploads it as the public copy of this photo.
  function confirmPhoto() {
    canvasRef.current.toBlob(
      (blurredBlob) => onConfirm({ id: photo.id, publicBlob: blurredBlob, privateBlob: photo.blob }),
      'image/jpeg',
      0.9
    );
  }

  // Scales the live drag rectangle from canvas pixels back to on-screen
  // CSS pixels, so the dashed preview box lines up with the display size.
  function overlayStyle() {
    if (!dragRect) return { display: 'none' };
    const canvas = canvasRef.current;
    const bounds = canvas.getBoundingClientRect();
    const scaleX = bounds.width / canvas.width;
    const scaleY = bounds.height / canvas.height;
    return {
      left: `${dragRect.x * scaleX}px`,
      top: `${dragRect.y * scaleY}px`,
      width: `${dragRect.width * scaleX}px`,
      height: `${dragRect.height * scaleY}px`,
    };
  }

  return (
    <div className="photo-blur-editor">
      <p className="photo-blur-editor__hint">
        Drag over anything private, like a screen or an ID number.
      </p>
      <div className="photo-blur-editor__canvas-wrap">
        <canvas
          ref={canvasRef}
          className="photo-blur-editor__canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
        <div className="photo-blur-editor__drag-box" style={overlayStyle()} />
      </div>
      <div className="photo-blur-editor__actions">
        <Button variant="quiet" size="md" onClick={startOver} disabled={!hasBlur}>
          Start over
        </Button>
        <Button variant="primary" size="md" icon="check" onClick={confirmPhoto}>
          Use this photo
        </Button>
      </div>
    </div>
  );
}