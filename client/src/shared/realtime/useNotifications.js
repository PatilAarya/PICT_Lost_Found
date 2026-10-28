// Hook that loads alerts and listens for new ones live.
import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../auth/useAuth.js';
import { useToast } from '../ui/index.js';
import { getSocket } from './socket.js';

const CHANGED_EVENT = 'notifications-changed';

export function useNotifications({ announce = false } = {}) {
  const { user } = useAuth();
  const userId = user ? user._id : null;
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await api.get('/notifications', { params: { limit: 50 } });
      setItems(res.data.items);
      setUnread(res.data.unread);
    } catch {
      // keep the alerts we already have
    }
  }, [userId]);

  useEffect(() => {
    load();
    window.addEventListener(CHANGED_EVENT, load);
    return () => window.removeEventListener(CHANGED_EVENT, load);
  }, [load]);

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

  async function markRead(id) {
    await api.patch(`/notifications/${id}/read`);
    window.dispatchEvent(new Event(CHANGED_EVENT));
  }

  async function markAllRead() {
    await api.patch('/notifications/read-all');
    window.dispatchEvent(new Event(CHANGED_EVENT));
  }

  return { items, unread, markRead, markAllRead };
}
