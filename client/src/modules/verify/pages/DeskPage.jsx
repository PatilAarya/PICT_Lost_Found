// Security desk page with its three tabs.
import { useState } from 'react';
import { Icon, PageHeader } from '../../../shared/ui/index.js';
import { QueueTab } from '../components/desk/QueueTab.jsx';
import { ReleaseTab } from '../components/desk/ReleaseTab.jsx';
import { IncomingTab } from '../components/desk/IncomingTab.jsx';

const TABS = [
  {
    id: 'queue',
    label: 'Claims to decide',
    icon: 'ticket',
    help: 'Someone answered the secret questions. Compare the answers and decide.',
    Panel: QueueTab,
  },
  {
    id: 'release',
    label: 'Release with code',
    icon: 'lock',
    help: 'The owner is at the desk. Check their college ID and type the code they show you.',
    Panel: ReleaseTab,
  },
  {
    id: 'incoming',
    label: 'Incoming items',
    icon: 'inbox',
    help: 'A finder said they dropped these at the desk. Mark each one received once you have it.',
    Panel: IncomingTab,
  },
];

export function DeskPage() {
  const [active, setActive] = useState('queue');
  const current = TABS.find((tab) => tab.id === active);

  return (
    <section className="page verify-page">
      <PageHeader
        title="Security desk"
        subtitle="Decide claims, hand items back and receive drop-offs."
      />
      <div className="tabs" role="tablist" aria-label="Desk sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === active}
            className="tab"
            onClick={() => setActive(tab.id)}
          >
            <Icon name={tab.icon} size={20} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="card" role="tabpanel" aria-label={current.label}>
        <p className="card-subtitle">{current.help}</p>
        <current.Panel />
      </div>
    </section>
  );
}
