// The first page after login: a greeting and a link to each section the user can open.
// The links come from the same nav.js files as the menu, so they never go out of date.
import { Link } from 'react-router-dom';
import { useAuth } from '../shared/auth/useAuth.js';
import { PageHeader } from '../shared/ui/index.js';
import { getNavItems } from './moduleDiscovery.js';

export function HomePage() {
  const { user, role } = useAuth();
  return (
    <section className="page">
      <PageHeader title={`Hello, ${user.name}`} subtitle="What do you need to do today?" />
      <ul className="home-links">
        {getNavItems(role).map((item) => (
          <li key={item.path}>
            <Link to={item.path}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
