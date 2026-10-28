// Helpers to notify handlers or one user.
import { services } from '../../../shared/services/registry.js';
import { User } from '../../../shared/models/User.js';

export async function notifyUser(userId, type, title, body, link) {
  await services.notify({ userId, type, title, body, link, data: {} });
}

export async function notifyHandlers(type, title, body, link) {
  const handlers = await User.find({ role: 'handler', status: 'active' }).select('_id');
  for (const handler of handlers) {
    await notifyUser(handler._id, type, title, body, link);
  }
}
