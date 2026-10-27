// The React context object that carries the auth state.
// AuthProvider.jsx fills it and useAuth.js reads it. It lives in its own file so
// both can import it without importing each other.
import { createContext } from 'react';

export const AuthContext = createContext(null);
