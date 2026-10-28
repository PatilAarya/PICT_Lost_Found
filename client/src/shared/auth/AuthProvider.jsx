// Keeps the logged-in user and shares it with the whole app.
import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { AuthContext } from './authContext.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  async function requestCode(email) {
    await api.post('/auth/request-code', { email });
  }

  async function verifyCode(email, code) {
    const res = await api.post('/auth/verify-code', { email, code });
    setUser(res.data.user);
  }

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
