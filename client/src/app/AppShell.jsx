// The frame around every logged-in page: a top bar (logo, alerts bell, user menu),
// the menu and the page itself. Menu items come from every module's nav.js, filtered
// by role; items only staff can see are grouped under "Desk tools". CSS in app.css puts
// the menu at the bottom on phones and as a left rail from 900px wide.
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../shared/auth/useAuth.js';
import { useNotifications } from '../shared/realtime/useNotifications.js';
import { BrandMark, Icon } from '../shared/ui/index.js';
import { getNavItems } from './moduleDiscovery.js';
import { UserMenu } from './UserMenu.jsx';

// One icon per menu path. Unknown paths simply show no icon.
const NAV_ICONS = {
  '/lost': 'search',
  '/found': 'package',
  '/verify': 'ticket',
  '/notifications': 'bell',
  '/verify/desk': 'inbox',
  '/verify/analytics': 'chart',
  '/verify/integrity': 'shield-check',
  '/verify/flags': 'flag',
};

// A menu item is a "desk tool" when students cannot see it.
function isStaffOnly(item) {
  return Boolean(item.roles) && !item.roles.includes('student');
}

// One link in the menu: icon plus label.
function MenuLink({ item }) {
  return (
    <NavLink to={item.path} end className="nav-link">
      <Icon name={NAV_ICONS[item.path]} size={22} />
      <span>{item.label}</span>
    </NavLink>
  );
}

export function AppShell() {
  const { role } = useAuth();
  // announce: true makes this one copy of the hook show a toast for each new alert.
  const { unread } = useNotifications({ announce: true });
  const navItems = getNavItems(role);
  const mainItems = navItems.filter((item) => !isStaffOnly(item));
  const staffItems = navItems.filter(isStaffOnly);

  return (
    <div className="shell">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <BrandMark size={36} light />
          <span className="brand-text">
            <strong>PICT Lost and Found</strong>
            <small>Lost property office</small>
          </span>
        </NavLink>
        <div className="topbar-actions">
          <NavLink to="/notifications" className="bell" aria-label={`Alerts, ${unread} unread`}>
            <Icon name="bell" size={24} />
            {unread > 0 ? <span className="bell-count tabular">{unread}</span> : null}
          </NavLink>
          <UserMenu />
        </div>
      </header>
      <nav className="mainnav" aria-label="Main">
        <NavLink to="/" end className="nav-link">
          <Icon name="home" size={22} />
          <span>Home</span>
        </NavLink>
        {mainItems.map((item) => (
          <MenuLink key={item.path} item={item} />
        ))}
        {staffItems.length > 0 ? <p className="nav-heading">Desk tools</p> : null}
        {staffItems.map((item) => (
          <MenuLink key={item.path} item={item} />
        ))}
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
