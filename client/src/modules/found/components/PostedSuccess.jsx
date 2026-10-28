// Shown after a found item is posted: the finished claim ticket with its real serial
// number, what to do next, and buttons to see your items or post another one.
import { useNavigate } from 'react-router-dom';
import { Button, PageHeader, PropertyTag } from '../../../shared/ui/index.js';
import { ticketFromItem } from '../utils/ticket.js';

export default function PostedSuccess({ item, onPostAnother }) {
  const navigate = useNavigate();
  const atDesk = item.custody?.type === 'desk';
  return (
    <section className="page">
      <PageHeader title="Item posted" subtitle="Thank you. The owner can now find it." />
      <div className="card success-card">
        <PropertyTag item={ticketFromItem(item)} />
        <p>
          {atDesk
            ? 'Next: take the item to the desk you chose and show this ticket number.'
            : 'Next: keep the item safe. We will tell you when the owner asks for it.'}
        </p>
        <div className="button-row">
          <Button onClick={() => navigate('/found')}>See my found items</Button>
          <Button variant="quiet" icon="plus" onClick={onPostAnother}>
            Post another
          </Button>
        </div>
      </div>
    </section>
  );
}
