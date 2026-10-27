// The hook every component uses to know who is logged in:
// const { user, role, loading, requestCode, verifyCode, logout } = useAuth();
// It must be used inside <AuthProvider> (App.jsx wraps the whole app in it).
import { useContext } from 'react';
import { AuthContext } from './authContext.js';

// Return the current auth state and login functions.
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside <AuthProvider>.');
  }
  return value;
}
