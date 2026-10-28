// One floor plan you can tap. It downloads the plan SVG (client/public/floorplans) and
// puts it straight into the page, so each room is a real element we can click and colour.
// A Pointer Event works the same for a mouse, a pen and a finger. The tapped room is
// highlighted and, in "pin" mode, a pin is drawn at the exact spot.
import { useEffect, useRef, useState } from 'react';
import { areaFromTarget, pointToFraction } from './pinMaths.js';

export function FloorPlan({ floor, value, mode, onPick }) {
  const boxRef = useRef(null);
  const [svgText, setSvgText] = useState('');
  const [failed, setFailed] = useState(false);

  // Download the plan for this floor. Our own static files, so inserting them is safe.
  useEffect(() => {
    // If the floor changes before the download finishes, ignore the old answer.
    let cancelled = false;
    async function loadPlan() {
      setSvgText('');
      setFailed(false);
      try {
        const response = await fetch(floor.plan);
        const text = await response.text();
        if (cancelled) return;
        // A missing file comes back as the app's index.html, so check it really is an SVG.
        if (response.ok && text.trim().startsWith('<svg')) {
          setSvgText(text);
        } else {
          setFailed(true);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    }
    loadPlan();
    return () => {
      cancelled = true;
    };
  }, [floor.plan]);

  // Colour the chosen room: add a class to it and remove it from every other room.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    for (const room of box.querySelectorAll('.area')) {
      room.classList.toggle('area-selected', room.id === value.areaId);
    }
  }, [svgText, value.areaId]);

  // A tap: work out the room and, in pin mode, the exact spot as 0..1 fractions.
  function handlePointerDown(event) {
    const svg = boxRef.current.querySelector('svg');
    const areaId = areaFromTarget(event.target, floor.areas) || value.areaId || '';
    if (mode !== 'pin') {
      onPick({ areaId });
      return;
    }
    const point = pointToFraction(event.clientX, event.clientY, svg.getBoundingClientRect());
    onPick({ areaId, x: point.x, y: point.y });
  }

  if (failed) return null;
  const showPin = mode === 'pin' && typeof value.x === 'number';
  return (
    <div className="plan-frame">
      <div
        ref={boxRef}
        className="plan-box"
        onPointerDown={handlePointerDown}
        dangerouslySetInnerHTML={{ __html: svgText }}
      />
      {showPin ? (
        <span
          className="plan-pin"
          // The pin's position is the same fraction of the box as the tap was.
          style={{ left: `${value.x * 100}%`, top: `${value.y * 100}%` }}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
