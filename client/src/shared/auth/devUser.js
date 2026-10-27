// Remembers which seeded user the developer picked in the DevUserSwitcher.
// Stored in localStorage (Web Storage) so the choice survives a page reload.
// api/client.js and realtime/socket.js read it; DevUserSwitcher.jsx writes it.

const STORAGE_KEY = 'pict-dev-user';

// Return the chosen dev email, or '' if none (or if storage is blocked).
export function getDevUser() {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

// Save the chosen dev email; an empty value means "use my real login".
export function setDevUser(email) {
  try {
    if (email) {
      localStorage.setItem(STORAGE_KEY, email);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Private browsing can block storage; the switcher then simply does nothing.
  }
}
