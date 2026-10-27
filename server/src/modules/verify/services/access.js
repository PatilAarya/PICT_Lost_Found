// Small helpers used by many verify routes: is this user staff, and load a
// document by id or stop with a clear 404. Keeping them here avoids repeating
// the same checks in every route file.
import mongoose from 'mongoose';
import { HttpError } from '../../../shared/utils/httpError.js';

export const STAFF_ROLES = ['handler', 'admin'];

// True for handlers and admins (the security desk and the admin office).
export function isStaff(user) {
  return STAFF_ROLES.includes(user.role);
}

// True when two ids (ObjectId or string) point to the same document.
export function sameId(first, second) {
  return String(first) === String(second);
}

// Find a document by id, or throw 404. Bad ids are a 404 too, not a server error.
export async function findOr404(Model, id, what, select) {
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(404, 'NOT_FOUND', `${what} not found.`);
  }
  const query = Model.findById(id);
  if (select) {
    query.select(select);
  }
  const doc = await query;
  if (!doc) {
    throw new HttpError(404, 'NOT_FOUND', `${what} not found.`);
  }
  return doc;
}
