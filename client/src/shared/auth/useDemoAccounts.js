// Hook that loads demo accounts and switches between them.
import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { closeSocket } from '../realtime/socket.js';
import { getDevUser, setDevUser } from './devUser.js';
import { useAuth } from './useAuth.js';

export function useDemoAccounts() {
  const { refresh } = useAuth();
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    api
      .get('/auth/dev-users')
      .then((res) => setAccounts(res.data.users))
      .catch(() => setAccounts([]));
  }, []);

  function switchTo(email) {
    setDevUser(email);
    closeSocket();
    refresh();
  }

  return { accounts, activeEmail: getDevUser(), switchTo };
}
