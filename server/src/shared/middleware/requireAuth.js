// Checks who is calling the API and puts that user on req.user.
// Normal login: a JWT in the httpOnly "token" cookie (set by the auth module).
// Dev login: the x-dev-user header with a seeded email, only when the dev switcher is on.
import jwt from 'jsonwebtoken';
import { config, isDevSwitcherOn } from '../config/index.js';
import { User } from '../models/User.js';
import { HttpError } from '../utils/httpError.js';

export const TOKEN_COOKIE = 'token';

// Read the user id out of a JWT, or return null if the token is missing or invalid.
export function readUserIdFromToken(token) {
  if (!token) {
    return null;
  }
  try {
    return jwt.verify(token, config.jwtSecret).userId;
  } catch {
    // An expired or edited token simply means "not logged in".
    return null;
  }
}

// Find the user for this request, or return null if nobody is logged in.
export async function findRequestUser(req) {
  const devEmail = req.get('x-dev-user');
  if (devEmail && isDevSwitcherOn()) {
    return User.findOne({ email: devEmail.toLowerCase() });
  }
  const token = req.cookies ? req.cookies[TOKEN_COOKIE] : null;
  const userId = readUserIdFromToken(token);
  return userId ? User.findById(userId) : null;
}

// Middleware: stop the request with 401 unless an active user is logged in.
export async function requireAuth(req, _res, next) {
  const user = await findRequestUser(req);
  if (!user) {
    throw new HttpError(401, 'NOT_LOGGED_IN', 'Log in to continue.');
  }
  if (user.status === 'suspended') {
    throw new HttpError(403, 'SUSPENDED', 'This account is suspended. Contact the admin office.');
  }
  req.user = user;
  next();
}
