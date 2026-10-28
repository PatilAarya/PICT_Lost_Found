// Lets the finder drag a box over a photo to blur private details.
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

  function handlePointerDown(event) {
    event.target.setPointerCapture(event.pointerId);
    const point = getCanvasPoint(canvasRef.current, event.clientX, event.clientY);
    setDragStart(point);
    setDragRect({ x: point.x, y: point.y, width: 0, height: 0 });
  }

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

  function handlePointerUp() {
    if (dragRect && dragRect.width > 4 && dragRect.height > 4) {
      blurRegion(canvasRef.current.getContext('2d'), dragRect, 12);
      setHasBlur(true);
    }
    setDragStart(null);
    setDragRect(null);
  }

  function startOver() {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.drawImage(imageRef.current, 0, 0);
    setHasBlur(false);
  }

  function confirmPhoto() {
    canvasRef.current.toBlob(
      (blurredBlob) =>
        onConfirm({ id: photo.id, publicBlob: blurredBlob, privateBlob: photo.blob }),
      'image/jpeg',
      0.9
    );
  }

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
