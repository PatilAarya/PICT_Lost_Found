// Holds the logged-in user for the whole app and shares it through React context.
// On load it asks GET /api/auth/me; requestCode and verifyCode run the email login.
// Read it anywhere with useAuth() (useAuth.js). Frozen after Phase 0.
import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { AuthContext } from './authContext.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ask the server who is logged in (cookie or dev user) and store the answer.
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Step 1 of login: email a 6-digit code.
  async function requestCode(email) {
    await api.post('/auth/request-code', { email });
  }

  // Step 2 of login: send the code; the server sets the cookie and returns the user.
  async function verifyCode(email, code) {
    const res = await api.post('/auth/verify-code', { email, code });
    setUser(res.data.user);
  }

  // Clear the login cookie on the server and forget the user here.
  async function logout() {
    await api.post('/auth/logout');
    setUser(null);
  }

  const value = {
    user,
    role: user ? user.role : null,
    loading,
    requestCode,
    verifyCode,
    logout,
    refresh,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
