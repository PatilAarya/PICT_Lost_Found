// Small helpers for staff checks and loading by id.
import mongoose from 'mongoose';
import { HttpError } from '../../../shared/utils/httpError.js';

export const STAFF_ROLES = ['handler', 'admin'];

export function isStaff(user) {
  return STAFF_ROLES.includes(user.role);
}

export function sameId(first, second) {
  return String(first) === String(second);
}

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
