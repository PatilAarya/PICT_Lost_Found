// Demo account buttons on the login page, development only.
import { Icon } from '../ui/index.js';
import { useDemoAccounts } from './useDemoAccounts.js';

const CARDS = [
  { role: 'student', title: 'Student', icon: 'user' },
  { role: 'handler', title: 'Security desk', icon: 'inbox' },
  { role: 'admin', title: 'Admin', icon: 'shield' },
];

export function DemoAccounts() {
  const { accounts, switchTo } = useDemoAccounts();
  if (accounts.length === 0) {
    return null;
  }

  return (
    <section className="demo-accounts" aria-labelledby="demo-title">
      <h2 id="demo-title" className="demo-title">
        Or try a demo account
      </h2>
      <div className="demo-cards">
        {CARDS.map((card) => {
          const person = accounts.find((account) => account.role === card.role);
          if (!person) return null;
          return (
            <button
              key={card.role}
              type="button"
              className="demo-card"
              onClick={() => switchTo(person.email)}
            >
              <Icon name={card.icon} size={24} />
              <strong>{card.title}</strong>
              <span>{person.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
