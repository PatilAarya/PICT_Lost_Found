// Allows a route only for certain roles, for example requireRole('handler', 'admin').
// Use it after requireAuth, because it reads req.user.
// Roles come from shared/constants.js (student, staff, handler, admin).
import { HttpError } from '../utils/httpError.js';

// Build a middleware that lets through only the listed roles.
export function requireRole(...allowedRoles) {
  return function checkRole(req, _res, next) {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new HttpError(403, 'FORBIDDEN', 'You do not have access to this page.');
    }
    next();
  };
}
