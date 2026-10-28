// "Try a demo account" on the login page (development only): three cards, one per kind
// of user, each logs in with a single click. It replaces the old "Act as" dropdown.
// Shows nothing when the server's dev login is off, so production stays clean.
import { Icon } from '../ui/index.js';
import { useDemoAccounts } from './useDemoAccounts.js';

// Which seeded role to show on each card, with a plain-language title.
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
          // The first seeded person with this role, for example the first student.
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
