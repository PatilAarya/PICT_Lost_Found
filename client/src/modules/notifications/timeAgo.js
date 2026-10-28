// Turns a time into text like "5 min ago".
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const dateOnly = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' });

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
