// Dev-only page that shows every shared UI component in one place.
import { useState } from 'react';
import { CATEGORIES } from '../../shared/constants.js';
import {
  Button,
  EMPTY_ART_NAMES,
  EmptyState,
  Icon,
  PageHeader,
  Pictogram,
  PropertyTag,
  Sheet,
  Spinner,
  Stamp,
  Stepper,
  Timeline,
  useToast,
} from '../../shared/ui/index.js';
import { ALL_STATUSES, SAMPLE_STEPS, SAMPLE_TICKETS, SAMPLE_TIMELINE } from './devSamples.js';
import { DevUiControls } from './DevUiControls.jsx';
import './devui.css';

const ICON_NAMES = [
  'arrow-right',
  'arrow-left',
  'close',
  'camera',
  'search',
  'bell',
  'check',
  'lock',
  'clock',
  'pin',
  'upload',
  'trash',
  'plus',
  'filter',
  'user',
  'shield',
];

function Section({ title, children }) {
  return (
    <section className="devui-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function DevUiPage() {
  const [status, setStatus] = useState('posted');
  const [sheetOpen, setSheetOpen] = useState(false);
  const toast = useToast();

  return (
    <div className="devui">
      <PageHeader title="Design system" subtitle="Every shared component, for checking only." />

      <Section title="Tickets">
        <div className="devui-stack">
          {SAMPLE_TICKETS.map((item) => (
            <PropertyTag key={item.serial} item={item} onClick={() => toast(item.serial)} />
          ))}
          {SAMPLE_TICKETS.map((item) => (
            <PropertyTag key={`${item.serial}-c`} item={item} compact />
          ))}
        </div>
      </Section>

      <Section title="Stamps">
        <div className="devui-row devui-stamps">
          {ALL_STATUSES.map((value) => (
            <Stamp key={value} status={value} />
          ))}
        </div>
        <p>Change the status to see the drop-in:</p>
        <div className="devui-row">
          <Stamp status={status} />
          <Button
            variant="quiet"
            onClick={() => setStatus(status === 'posted' ? 'matched' : 'posted')}
          >
            Change status
          </Button>
        </div>
      </Section>

      <Section title="Pictograms">
        <div className="devui-row">
          {CATEGORIES.map((category) => (
            <figure key={category} className="devui-figure">
              <Pictogram category={category} size={48} />
              <figcaption>{category}</figcaption>
            </figure>
          ))}
        </div>
        <div className="devui-row">
          {ICON_NAMES.map((name) => (
            <figure key={name} className="devui-figure">
              <Icon name={name} size={28} />
              <figcaption>{name}</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <DevUiControls />

      <Section title="Timeline and stepper">
        <Stepper steps={SAMPLE_STEPS} current={2} />
        <Timeline steps={SAMPLE_TIMELINE} />
      </Section>

      <Section title="Empty states">
        <div className="devui-grid">
          {EMPTY_ART_NAMES.map((name) => (
            <EmptyState
              key={name}
              illustration={name}
              title={name.replace('-', ' ')}
              action={
                <Button variant="secondary" icon="plus">
                  Report lost item
                </Button>
              }
            />
          ))}
        </div>
      </Section>

      <Section title="Sheet, toast and spinner">
        <div className="devui-row">
          <Button variant="quiet" onClick={() => setSheetOpen(true)}>
            Open sheet
          </Button>
          <Button variant="quiet" onClick={() => toast('Claim sent')}>
            Show toast
          </Button>
        </div>
        <Spinner />
        <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Confirm">
          <p>Post this found item? You can change it until the desk receives it.</p>
          <Button onClick={() => setSheetOpen(false)}>Post found item</Button>
        </Sheet>
      </Section>
    </div>
  );
}
