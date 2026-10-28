// Alerts page listing new and earlier notifications.
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../shared/realtime/useNotifications.js';
import { Button, EmptyState, Icon, PageHeader } from '../../shared/ui/index.js';
import { timeAgo } from './timeAgo.js';
import './notifications.css';

const TYPE_ICONS = {
  MATCH_FOUND: 'search',
  ITEM_STATUS: 'package',
  CLAIM_UPDATE: 'ticket',
  HANDOVER_READY: 'lock',
  ITEM_EXPIRING: 'clock',
  ACCOUNT_FLAGGED: 'flag',
};

function AlertRow({ alert, onOpen }) {
  const isNew = !alert.readAt;
  return (
    <li className={isNew ? 'alert-row alert-new' : 'alert-row'}>
      <span className="alert-icon">
        <Icon name={TYPE_ICONS[alert.type] || 'bell'} size={22} />
      </span>
      <div className="alert-text">
        <strong>{alert.title}</strong>
        {alert.body ? <span>{alert.body}</span> : null}
        <span className="muted tabular">
          {isNew ? 'New · ' : ''}
          {timeAgo(alert.createdAt)}
        </span>
      </div>
      {alert.link ? (
        <Button variant="quiet" onClick={() => onOpen(alert)}>
          Open
        </Button>
      ) : null}
    </li>
  );
}

function AlertGroup({ title, alerts, onOpen }) {
  if (alerts.length === 0) return null;
  return (
    <div className="card">
      <h2 className="card-title">{title}</h2>
      <ul className="alert-list">
        {alerts.map((alert) => (
          <AlertRow key={alert._id} alert={alert} onOpen={onOpen} />
        ))}
      </ul>
    </div>
  );
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const { items, unread, markRead, markAllRead } = useNotifications();

  async function handleOpen(alert) {
    if (!alert.readAt) await markRead(alert._id);
    navigate(alert.link);
  }

  return (
    <section className="page">
      <PageHeader
        title="Alerts"
        subtitle={unread > 0 ? `${unread} new` : 'You are all caught up.'}
        actions={
          unread > 0 ? (
            <Button variant="quiet" icon="check" onClick={markAllRead}>
              Mark all as read
            </Button>
          ) : null
        }
      />
      {items.length === 0 ? (
        <EmptyState
          illustration="no-notifications"
          title="No alerts yet. We tell you here when an item matches your report."
        />
      ) : null}
      <AlertGroup title="New" alerts={items.filter((item) => !item.readAt)} onOpen={handleOpen} />
      <AlertGroup
        title="Earlier"
        alerts={items.filter((item) => item.readAt)}
        onOpen={handleOpen}
      />
    </section>
  );
}
