// /verify/desk - the security desk's workspace, in three tabs: decide waiting claims,
// release items with the owner's code, and receive items dropped at the desk.
// The tab buttons use role="tab" and aria-selected so screen readers announce them.
import { useState } from 'react';
import { PageHeader } from '../../../shared/ui/index.js';
import { QueueTab } from '../components/desk/QueueTab.jsx';
import { ReleaseTab } from '../components/desk/ReleaseTab.jsx';
import { IncomingTab } from '../components/desk/IncomingTab.jsx';

const TABS = [
  { id: 'queue', label: 'Claims to decide', Panel: QueueTab },
  { id: 'release', label: 'Release with code', Panel: ReleaseTab },
  { id: 'incoming', label: 'Incoming items', Panel: IncomingTab },
];

export function DeskPage() {
  const [active, setActive] = useState('queue');
  const current = TABS.find((tab) => tab.id === active);

  return (
    <section className="page verify-page">
      <PageHeader title="Handler desk" />
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
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-label={current.label}>
        <current.Panel />
      </div>
    </section>
  );
}
