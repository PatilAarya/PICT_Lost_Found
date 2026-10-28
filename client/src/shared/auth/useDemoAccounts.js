// The seeded demo accounts (development only) and a function to switch to one.
// It asks GET /api/auth/dev-users; the server answers 404 when the dev login is off
// (production or DEV_AUTH=false), and then the list is simply empty, so nothing shows.
// Used by DemoAccounts.jsx (login page) and app/UserMenu.jsx (top bar).
import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { closeSocket } from '../realtime/socket.js';
import { getDevUser, setDevUser } from './devUser.js';
import { useAuth } from './useAuth.js';

export function useDemoAccounts() {
  const { refresh } = useAuth();
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    // import.meta.env.DEV is false in production builds, so we never even ask there.
    if (!import.meta.env.DEV) return;
    api
      .get('/auth/dev-users')
      .then((res) => setAccounts(res.data.users))
      .catch(() => setAccounts([]));
  }, []);

  // Act as this seeded user ('' goes back to your own email login).
  function switchTo(email) {
    setDevUser(email);
    // The live connection belongs to the old user, so close it; it reopens for the new one.
    closeSocket();
    refresh();
  }

  return { accounts, activeEmail: getDevUser(), switchTo };
}
