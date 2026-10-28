// The notifications hook (docs/CONTRACT.md section F): { items, unread, markRead, markAllRead }.
// It loads my alerts from GET /api/notifications, then listens to the Socket.IO
// "notification" event so a new alert appears at once, without refreshing the page.
// Several components use it (the bell, the Alerts page); after marking something read,
// a browser event tells every copy to reload, so all of them show the same count.
// Pass { announce: true } in exactly one place (the app shell) to show a toast for new alerts.
import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../auth/useAuth.js';
import { useToast } from '../ui/index.js';
import { getSocket } from './socket.js';

// The name of the browser event that says "alerts changed, reload them".
const CHANGED_EVENT = 'notifications-changed';

export function useNotifications({ announce = false } = {}) {
  const { user } = useAuth();
  const userId = user ? user._id : null;
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  // Ask the server for my newest alerts and my unread count.
  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await api.get('/notifications', { params: { limit: 50 } });
      setItems(res.data.items);
      setUnread(res.data.unread);
    } catch {
      // Not logged in any more, or the server is down: keep what we have.
    }
  }, [userId]);

  // Load once per logged-in user, and again whenever another copy says alerts changed.
  useEffect(() => {
    load();
    window.addEventListener(CHANGED_EVENT, load);
    return () => window.removeEventListener(CHANGED_EVENT, load);
  }, [load]);

  // Listen for live alerts. Re-run when the user changes, because switching account
  // closes the old socket and getSocket() opens a new one for the new user.
  useEffect(() => {
    if (!userId) return undefined;
    const socket = getSocket();
    function handleNew(notification) {
      setItems((current) => [notification, ...current]);
      setUnread((current) => current + 1);
      if (announce) toast(`New alert: ${notification.title}`);
    }
    socket.on('notification', handleNew);
    return () => socket.off('notification', handleNew);
  }, [userId, announce, toast]);

  // Mark one alert as read, then tell every copy of this hook to reload.
  async function markRead(id) {
    await api.patch(`/notifications/${id}/read`);
    window.dispatchEvent(new Event(CHANGED_EVENT));
  }

  // Mark all my alerts as read, then tell every copy to reload.
  async function markAllRead() {
    await api.patch('/notifications/read-all');
    window.dispatchEvent(new Event(CHANGED_EVENT));
  }

  return { items, unread, markRead, markAllRead };
}
