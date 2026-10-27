// Shows its children only to users with one of the allowed roles, for example
// <RequireRole roles={['handler', 'admin']}>. The router wraps a page in it when the
// module's routes.jsx gives that page a roles list. The server checks roles again.
import { useAuth } from './useAuth.js';

export function RequireRole({ roles, children }) {
  const { role } = useAuth();
  if (roles && !roles.includes(role)) {
    return (
      <section className="page">
        <h1>No access</h1>
        <p>This page is for {roles.join(' and ')} accounts. Switch account or go back.</p>
      </section>
    );
  }
  return children;
}
