// Home page after login with the main actions and how the app works.
import { Link } from 'react-router-dom';
import { useAuth } from '../shared/auth/useAuth.js';
import { Icon, PageHeader, Pictogram } from '../shared/ui/index.js';
import './home.css';

const STEPS = [
  { title: 'Report', text: 'Say what you lost and tap where you last had it.' },
  { title: 'Match', text: 'Every item handed in is compared with your report.' },
  { title: 'Prove', text: 'Answer questions only the real owner would know.' },
  { title: 'Collect', text: 'Show your one-time code at the security desk.' },
];

function ActionCard({ to, category, kind, title, text }) {
  return (
    <Link to={to} className={`action-card action-${kind}`}>
      <Pictogram category={category} size={56} />
      <span className="action-text">
        <strong>{title}</strong>
        <span>{text}</span>
      </span>
      <Icon name="arrow-right" size={24} />
    </Link>
  );
}

export function HomePage() {
  const { user, role } = useAuth();
  const isStaff = role === 'handler' || role === 'admin';
  const firstName = user.name.split(' ')[0];

  return (
    <section className="page">
      <PageHeader title={`Hello, ${firstName}`} subtitle="What would you like to do today?" />
      <div className="action-grid">
        <ActionCard
          to="/lost"
          category="bag"
          kind="lost"
          title="I lost something"
          text="Report it and we will look for a match."
        />
        <ActionCard
          to="/found/new"
          category="keys"
          kind="found"
          title="I found something"
          text="Post it so the owner can get it back."
        />
        {isStaff ? (
          <ActionCard
            to="/verify/desk"
            category="other"
            kind="desk"
            title="Open the desk"
            text="Decide claims, release items, receive drop-offs."
          />
        ) : null}
      </div>
      <div className="card">
        <h2 className="card-title">How it works</h2>
        <p className="card-subtitle">Four steps from losing something to getting it back.</p>
        <ol className="how-it-works">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <span className="how-number tabular">{index + 1}</span>
              <strong>{step.title}</strong>
              <span className="muted">{step.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
