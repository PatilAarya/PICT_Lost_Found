// STUB of the notifications hook (docs/CONTRACT.md section F).
// Member 1 replaces the inside with real data and the "notification" socket event,
// but the returned shape must stay: { items, unread, markRead, markAllRead }.
import { useState } from 'react';

// Return the user's notifications. The stub has none.
export function useNotifications() {
  const [items] = useState([]);

  // Mark one notification as read (does nothing in the stub).
  async function markRead(_id) {}

  // Mark every notification as read (does nothing in the stub).
  async function markAllRead() {}

  return { items, unread: 0, markRead, markAllRead };
}
