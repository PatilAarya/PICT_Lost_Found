// A small dropdown, shown only in development, to act as any seeded user
// (student, handler or admin) without logging in by email. It saves the choice with
// setDevUser(); api/client.js then sends it as the x-dev-user header on every request.
import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { closeSocket } from '../realtime/socket.js';
import { getDevUser, setDevUser } from './devUser.js';
import { useAuth } from './useAuth.js';

export function DevUserSwitcher() {
  const { refresh } = useAuth();
  const [users, setUsers] = useState([]);
  const [chosen, setChosen] = useState(getDevUser());

  useEffect(() => {
    // The server answers 404 when the switcher is off; then we show nothing.
    api
      .get('/auth/dev-users')
      .then((res) => setUsers(res.data.users))
      .catch(() => setUsers([]));
  }, []);

  // Remember the new choice, drop the old user's live connection, reload who is logged in.
  function handleChange(event) {
    setChosen(event.target.value);
    setDevUser(event.target.value);
    closeSocket();
    refresh();
  }

  if (!import.meta.env.DEV || users.length === 0) {
    return null;
  }
  return (
    <label className="dev-switcher">
      <span>Act as</span>
      <select value={chosen} onChange={handleChange}>
        <option value="">My own login</option>
        {users.map((person) => (
          <option key={person.email} value={person.email}>
            {person.name} ({person.role})
          </option>
        ))}
      </select>
    </label>
  );
}
