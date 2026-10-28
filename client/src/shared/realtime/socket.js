// Opens the Socket.IO connection for live updates.
import { io } from 'socket.io-client';
import { getDevUser } from '../auth/devUser.js';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io({ withCredentials: true, auth: { devUser: getDevUser() } });
  }
  return socket;
}

export function closeSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
