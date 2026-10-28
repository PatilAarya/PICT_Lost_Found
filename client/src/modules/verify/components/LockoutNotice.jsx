// Lockout message with a countdown after 3 wrong answers.
import { useEffect } from 'react';
import { Icon } from '../../../shared/ui/index.js';
import { useCountdown } from '../hooks/useCountdown.js';
import { formatCountdown } from '../format.js';

export function LockoutNotice({ lockedUntil, onUnlock }) {
  const msLeft = useCountdown(lockedUntil);

  useEffect(() => {
    if (!lockedUntil || msLeft > 0) {
      return undefined;
    }
    const timer = setTimeout(onUnlock, 1500);
    return () => clearTimeout(timer);
  }, [lockedUntil, msLeft, onUnlock]);

  return (
    <div className="lockout" role="status">
      <Icon name="lock" size={40} />
      <p className="lockout-time tabular" aria-live="off">
        {formatCountdown(msLeft)}
      </p>
      <p>3 wrong answers. Try again when the timer ends, or ask at the desk.</p>
    </div>
  );
}
