// Hook that counts down to a time every second.
import { useEffect, useState } from 'react';

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
    return () => clearInterval(timer);
  }, [target]);

  return msLeft;
}
