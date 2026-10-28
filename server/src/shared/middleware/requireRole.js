// Allows a route only for certain roles.
import { HttpError } from '../utils/httpError.js';

export function requireRole(...allowedRoles) {
  return function checkRole(req, _res, next) {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new HttpError(403, 'FORBIDDEN', 'You do not have access to this page.');
    }
    next();
  };
}
