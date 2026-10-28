// Finds the logged-in user for each request.
import jwt from 'jsonwebtoken';
import { config, isDevSwitcherOn } from '../config/index.js';
import { User } from '../models/User.js';
import { HttpError } from '../utils/httpError.js';

export const TOKEN_COOKIE = 'token';

export function readUserIdFromToken(token) {
  if (!token) {
    return null;
  }
  try {
    return jwt.verify(token, config.jwtSecret).userId;
  } catch {
    return null;
  }
}

export async function findRequestUser(req) {
  const devEmail = req.get('x-dev-user');
  if (devEmail && isDevSwitcherOn()) {
    return User.findOne({ email: devEmail.toLowerCase() });
  }
  const token = req.cookies ? req.cookies[TOKEN_COOKIE] : null;
  const userId = readUserIdFromToken(token);
  return userId ? User.findById(userId) : null;
}

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
