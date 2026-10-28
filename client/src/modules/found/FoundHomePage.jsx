// Landing page for the Found module: buttons to post a new item or see your history.
// Buttons use navigate() instead of wrapping a <button> in a <Link>, because a button
// inside a link is invalid HTML and confuses keyboard and screen-reader users.
import { useNavigate } from 'react-router-dom';
import { PageHeader, Button } from '../../shared/ui/index.js';

export function FoundHomePage() {
  const navigate = useNavigate();
  return (
    <section className="page">
      <PageHeader
        title="Found items"
        subtitle="Found something on campus? Post it so the owner can find it."
      />
      <div className="found-home__actions">
        <Button icon="plus" onClick={() => navigate('/found/new')}>
          Post found item
        </Button>
        <Button variant="quiet" onClick={() => navigate('/found/mine')}>
          My found items
        </Button>
      </div>
    </section>
  );
}
