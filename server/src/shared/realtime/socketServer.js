// Links each Socket.IO connection to the logged-in user.
import { isDevSwitcherOn } from '../config/index.js';
import { TOKEN_COOKIE, readUserIdFromToken } from '../middleware/requireAuth.js';
import { User } from '../models/User.js';

export function userRoom(userId) {
  return `user:${userId}`;
}

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

async function findSocketUser(socket) {
  const devEmail = socket.handshake.auth ? socket.handshake.auth.devUser : null;
  if (devEmail && isDevSwitcherOn()) {
    const devUser = await User.findOne({ email: devEmail.toLowerCase() });
    return devUser ? devUser._id : null;
  }
  const token = readCookie(socket.handshake.headers.cookie, TOKEN_COOKIE);
  return readUserIdFromToken(token);
}

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
