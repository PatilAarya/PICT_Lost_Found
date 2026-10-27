// client/src/modules/found/FoundHomePage.jsx
// Landing page for the Found module: links to post a new item or see your history.
import { Link } from 'react-router-dom';
import { PageHeader, Button } from '../../shared/ui/index.js';

export function FoundHomePage() {
  return (
    <section className="page">
      <PageHeader
        title="Found items"
        subtitle="Found something on campus? Post it so the owner can find it."
      />
      <div className="found-home__actions">
        <Link to="/found/new">
          <Button>Post a found item</Button>
        </Link>
        <Link to="/found/mine">
          <Button variant="ghost">My found items</Button>
        </Link>
      </div>
    </section>
  );
}
