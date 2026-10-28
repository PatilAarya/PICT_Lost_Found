// Left side of the login page: logo, sample ticket and the four steps.
import { BrandMark, PropertyTag } from '../shared/ui/index.js';

const SAMPLE_TICKET = {
  kind: 'found',
  serial: 'PICT-F-000123',
  category: 'phone',
  title: 'Black phone with a blue case',
  status: 'in_custody',
  locationLabel: 'Canteen, ground floor',
  timeLabel: 'Found today, 1:15 pm',
};

const STEPS = [
  { title: 'Report', text: 'Lost something? Tap where you last had it.' },
  { title: 'Match', text: 'We compare it with every item handed in.' },
  { title: 'Prove', text: 'Answer questions only the owner would know.' },
  { title: 'Collect', text: 'Show a one-time code at the security desk.' },
];

export function LoginIntro() {
  return (
    <section className="login-intro">
      <div className="login-brand">
        <BrandMark size={56} light />
        <div>
          <p className="login-college">Pune Institute of Computer Technology</p>
          <p className="login-app">Lost and Found</p>
        </div>
      </div>
      <h2 className="login-headline">Lost it on campus? Found something? Start here.</h2>
      <div className="login-sample" aria-hidden="true">
        <PropertyTag item={SAMPLE_TICKET} />
      </div>
      <ol className="login-steps">
        {STEPS.map((step, index) => (
          <li key={step.title}>
            <span className="login-step-number tabular">{index + 1}</span>
            <span>
              <strong>{step.title}</strong> {step.text}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
