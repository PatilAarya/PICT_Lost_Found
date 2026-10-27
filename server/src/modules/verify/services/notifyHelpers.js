// Small wrappers around services.notify so verify code reads clearly:
// notifyHandlers() tells every security-desk handler, notifyUser() tells one person.
// services.notify is a stub until the notifications module registers the real one.
import { services } from '../../../shared/services/registry.js';
import { User } from '../../../shared/models/User.js';

// Send one notification to one user.
export async function notifyUser(userId, type, title, body, link) {
  await services.notify({ userId, type, title, body, link, data: {} });
}

// Send the same notification to every active handler.
export async function notifyHandlers(type, title, body, link) {
  const handlers = await User.find({ role: 'handler', status: 'active' }).select('_id');
  for (const handler of handlers) {
    await notifyUser(handler._id, type, title, body, link);
  }
}
