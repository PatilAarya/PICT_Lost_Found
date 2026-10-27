// Placeholder page for notifications (Member 1 replaces it).
// Already uses the useNotifications() stub, so the hook's shape is tested from day 1.
import { useNotifications } from '../../shared/realtime/useNotifications.js';
import { EmptyState, PageHeader } from '../../shared/ui/index.js';

export function NotificationsPage() {
  const { items, unread } = useNotifications();
  return (
    <section className="page">
      <PageHeader title="Alerts" subtitle={`${unread} unread`} />
      {items.length === 0 ? <EmptyState title="No alerts yet." /> : null}
    </section>
  );
}
