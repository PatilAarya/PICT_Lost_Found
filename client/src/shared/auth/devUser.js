// Remembers the chosen demo account in localStorage.
const STORAGE_KEY = 'pict-dev-user';

export function getDevUser() {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setDevUser(email) {
  try {
    if (email) {
      localStorage.setItem(STORAGE_KEY, email);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // storage blocked, ignore
  }
}
