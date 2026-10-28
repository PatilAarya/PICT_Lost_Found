// The frame around every logged-in page: top bar, menu and the page.
import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../shared/auth/useAuth.js';
import { useNotifications } from '../shared/realtime/useNotifications.js';
import { loadPlaces } from '../shared/location-picker/places.js';
import { BrandMark, Icon, Spinner } from '../shared/ui/index.js';
import { getNavItems } from './moduleDiscovery.js';
import { UserMenu } from './UserMenu.jsx';

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

function isStaffOnly(item) {
  return Boolean(item.roles) && !item.roles.includes('student');
}

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
  const { unread } = useNotifications({ announce: true });
  const navItems = getNavItems(role);
  const mainItems = navItems.filter((item) => !isStaffOnly(item));
  const staffItems = navItems.filter(isStaffOnly);
  const [placesReady, setPlacesReady] = useState(false);

  useEffect(() => {
    loadPlaces().then(() => setPlacesReady(true));
  }, []);

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
      <main className="content">{placesReady ? <Outlet /> : <Spinner />}</main>
    </div>
  );
}
