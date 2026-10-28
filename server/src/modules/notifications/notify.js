// The real services.notify (contract section D). One call does three things:
// 1. saves the Notification, so it appears in the Alerts list later;
// 2. emits it over Socket.IO to the room "user:<id>", so an open browser updates at once;
// 3. for HANDOVER_READY and ITEM_EXPIRING only, also sends an email, because those
//    need action even when the person is not looking at the app.
import { config } from '../../shared/config/index.js';
import { User } from '../../shared/models/User.js';
import { userRoom } from '../../shared/realtime/socketServer.js';
import { sendMail } from '../../shared/utils/mailer.js';
import { Notification } from './Notification.js';

export const EMAIL_TYPES = ['HANDOVER_READY', 'ITEM_EXPIRING'];

// Email one notification, with a full link back to the app. Never throws:
// a failed email must not undo the saved notification.
async function emailNotification(notification) {
  try {
    const user = await User.findById(notification.userId).select('email');
    if (!user) return;
    const link = notification.link ? `\n\nOpen it: ${config.clientUrl}${notification.link}` : '';
    await sendMail({
      to: user.email,
      subject: notification.title,
      text: `${notification.body}${link}`,
    });
  } catch (err) {
    console.error('[notify] email failed:', err.message);
  }
}

// Build the notify function. io is Socket.IO from server.js; tests may pass null.
export function createNotify(io) {
  return async function notify({ userId, type, title, body = '', link = '', data = {} }) {
    const notification = await Notification.create({ userId, type, title, body, link, data });
    if (io) {
      // Only sockets in this person's room receive it (see shared/realtime/socketServer.js).
      io.to(userRoom(userId)).emit('notification', notification);
    }
    if (EMAIL_TYPES.includes(type)) {
      await emailNotification(notification);
    }
    return notification;
  };
}
