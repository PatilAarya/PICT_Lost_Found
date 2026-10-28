// The round avatar at the top right. Clicking it opens a small menu with the person's
// name and role, a list of demo accounts to switch to (development only), and Log out.
// It closes when you click outside it or press Escape. Replaces the "Act as" dropdown.
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../shared/auth/useAuth.js';
import { useDemoAccounts } from '../shared/auth/useDemoAccounts.js';
import { setDevUser } from '../shared/auth/devUser.js';
import { closeSocket } from '../shared/realtime/socket.js';
import { Icon } from '../shared/ui/index.js';
import './userMenu.css';

const ROLE_NAMES = {
  student: 'Student',
  staff: 'Staff',
  handler: 'Security desk',
  admin: 'Admin',
};

// "Vikram Rao" becomes "VR".
function initialsOf(name) {
  const words = String(name || '?')
    .split(' ')
    .filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

export function UserMenu() {
  const { user, role, logout } = useAuth();
  const { accounts, switchTo } = useDemoAccounts();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // While open, close on a click outside the menu or on the Escape key.
  useEffect(() => {
    if (!open) return undefined;
    function handleClick(event) {
      if (!menuRef.current.contains(event.target)) setOpen(false);
    }
    function handleKey(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  // Switch account and close the menu.
  function choose(email) {
    setOpen(false);
    switchTo(email);
  }

  // Forget the demo account too, otherwise its header would log us straight back in.
  async function handleLogout() {
    setOpen(false);
    setDevUser('');
    closeSocket();
    await logout();
  }

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        type="button"
        className="user-button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(!open)}
      >
        <span className="avatar">{initialsOf(user.name)}</span>
        <span className="user-button-name">{user.name}</span>
        <Icon name="caret-down" size={16} />
      </button>
      {open ? (
        <div className="user-panel">
          <p className="user-panel-name">{user.name}</p>
          <p className="user-panel-meta">
            {ROLE_NAMES[role] || role} · {user.email}
          </p>
          {accounts.length > 0 ? (
            <div className="user-panel-demo">
              <p className="user-panel-heading">Switch demo account</p>
              {accounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  className="user-panel-item"
                  aria-current={account.email === user.email ? 'true' : undefined}
                  onClick={() => choose(account.email)}
                >
                  <span>{account.name}</span>
                  <span className="muted">{ROLE_NAMES[account.role]}</span>
                </button>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            className="user-panel-item user-panel-logout"
            onClick={handleLogout}
          >
            <Icon name="sign-out" size={20} />
            <span>Log out</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
