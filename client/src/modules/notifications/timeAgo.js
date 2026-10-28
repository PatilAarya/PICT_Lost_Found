// "Just now", "5 min ago", "3 hours ago", "Yesterday" or a date, for alert times.
// Plain maths on milliseconds; Intl.DateTimeFormat (the browser's own) for older dates.

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const dateOnly = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' });

// How long ago `value` was, compared with `now` (passed in so tests can fix the time).
export function timeAgo(value, now = Date.now()) {
  const passed = now - new Date(value).getTime();
  if (passed < MINUTE) return 'Just now';
  if (passed < HOUR) return `${Math.floor(passed / MINUTE)} min ago`;
  if (passed < DAY) {
    const hours = Math.floor(passed / HOUR);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (passed < 2 * DAY) return 'Yesterday';
  return dateOnly.format(new Date(value));
}
