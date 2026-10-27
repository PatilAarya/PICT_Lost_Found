// Connects each browser's Socket.IO connection to the logged-in user.
// Every socket joins the room "user:<userId>", so a module can send a live
// notification to one person with io.to(userRoom(id)).emit('notification', doc).
// The login check is the same as requireAuth: the JWT cookie, or the dev switcher.
import { isDevSwitcherOn } from '../config/index.js';
import { TOKEN_COOKIE, readUserIdFromToken } from '../middleware/requireAuth.js';
import { User } from '../models/User.js';

// The room name used for one user's live updates.
export function userRoom(userId) {
  return `user:${userId}`;
}

// Read one cookie value from a raw "a=1; b=2" cookie header.
function readCookie(cookieHeader, name) {
  const parts = (cookieHeader || '').split(';');
  for (const part of parts) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return null;
}

// Work out which user opened this socket, or null.
async function findSocketUser(socket) {
  const devEmail = socket.handshake.auth ? socket.handshake.auth.devUser : null;
  if (devEmail && isDevSwitcherOn()) {
    const devUser = await User.findOne({ email: devEmail.toLowerCase() });
    return devUser ? devUser._id : null;
  }
  const token = readCookie(socket.handshake.headers.cookie, TOKEN_COOKIE);
  return readUserIdFromToken(token);
}

// Add the login check to Socket.IO and put each socket in its user's room.
export function setupRealtime(io) {
  io.use(async (socket, next) => {
    const userId = await findSocketUser(socket);
    if (!userId) {
      return next(new Error('NOT_LOGGED_IN'));
    }
    socket.data.userId = String(userId);
    next();
  });

  io.on('connection', (socket) => {
    socket.join(userRoom(socket.data.userId));
  });
}
