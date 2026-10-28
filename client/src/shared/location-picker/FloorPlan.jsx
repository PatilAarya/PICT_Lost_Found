// A floor plan you can tap to pick a room and drop a pin.
import { useEffect, useRef, useState } from 'react';
import { areaFromTarget, pointToFraction } from './pinMaths.js';

export function FloorPlan({ floor, value, mode, onPick }) {
  const boxRef = useRef(null);
  const [svgText, setSvgText] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadPlan() {
      setSvgText('');
      setFailed(false);
      try {
        const response = await fetch(floor.plan);
        const text = await response.text();
        if (cancelled) return;
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

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    for (const room of box.querySelectorAll('.area')) {
      room.classList.toggle('area-selected', room.id === value.areaId);
    }
  }, [svgText, value.areaId]);

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
          style={{ left: `${value.x * 100}%`, top: `${value.y * 100}%` }}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
