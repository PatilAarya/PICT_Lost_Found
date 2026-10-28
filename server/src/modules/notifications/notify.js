// Saves an alert, sends it live and emails it when needed.
import { config } from '../../shared/config/index.js';
import { User } from '../../shared/models/User.js';
import { userRoom } from '../../shared/realtime/socketServer.js';
import { sendMail } from '../../shared/utils/mailer.js';
import { Notification } from './Notification.js';

export const EMAIL_TYPES = ['HANDOVER_READY', 'ITEM_EXPIRING'];

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

export function createNotify(io) {
  return async function notify({ userId, type, title, body = '', link = '', data = {} }) {
    const notification = await Notification.create({ userId, type, title, body, link, data });
    if (io) {
      io.to(userRoom(userId)).emit('notification', notification);
    }
    if (EMAIL_TYPES.includes(type)) {
      await emailNotification(notification);
    }
    return notification;
  };
}
