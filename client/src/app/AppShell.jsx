// The frame around every logged-in page: a top bar, the menu and the page itself.
// The menu comes from every module's nav.js (filtered by role). CSS in app.css puts
// it at the bottom on phones and as a left rail from 900px wide. Frozen after Phase 0.
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../shared/auth/useAuth.js';
import { DevUserSwitcher } from '../shared/auth/DevUserSwitcher.jsx';
import { Button } from '../shared/ui/index.js';
import { getNavItems } from './moduleDiscovery.js';

export function AppShell() {
  const { user, role, logout } = useAuth();
  const navItems = getNavItems(role);

  return (
    <div className="shell">
      <header className="topbar">
        <NavLink to="/" className="brand">
          PICT Lost and Found
        </NavLink>
        <div className="topbar-user">
          <DevUserSwitcher />
          <span>
            {user.name} <span className="role-tag">{role}</span>
          </span>
          <Button variant="quiet" onClick={logout}>
            Log out
          </Button>
        </div>
      </header>
      <nav className="mainnav" aria-label="Main">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} end>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
