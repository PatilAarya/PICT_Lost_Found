// Opens one Socket.IO connection to the server for live updates.
// The browser sends the login cookie automatically; in development the chosen dev
// user is sent in `auth` instead. The server puts this socket in the room user:<id>.
import { io } from 'socket.io-client';
import { getDevUser } from '../auth/devUser.js';

let socket = null;

// Return the shared socket, creating it the first time.
export function getSocket() {
  if (!socket) {
    // No URL: connect to the same address as the page; Vite proxies /socket.io in dev.
    socket = io({ withCredentials: true, auth: { devUser: getDevUser() } });
  }
  return socket;
}

// Close the socket (for example after logout or switching dev user).
export function closeSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
