// Counts down to a moment in time, ticking once a second with setInterval.
// Returns the milliseconds left (never below 0). The interval is cleared when the
// component unmounts or the target changes, so no timers are left running.
import { useEffect, useState } from 'react';

// Milliseconds from now until `target` (0 if it has passed).
function msUntil(target) {
  return Math.max(0, new Date(target).getTime() - Date.now());
}

export function useCountdown(target) {
  const [msLeft, setMsLeft] = useState(() => (target ? msUntil(target) : 0));

  useEffect(() => {
    if (!target) {
      return undefined;
    }
    setMsLeft(msUntil(target));
    const timer = setInterval(() => setMsLeft(msUntil(target)), 1000);
    // Cleanup: React calls this when the component goes away.
    return () => clearInterval(timer);
  }, [target]);

  return msLeft;
}
