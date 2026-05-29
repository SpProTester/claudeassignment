import { Notification } from '../models/index.js';
import { getIO } from '../socket.js';

/**
 * Creates a DB notification, emits it over Socket.io, and optionally fires an email.
 *
 * @param {string} userId
 * @param {string} type  - must match Notification ENUM
 * @param {{ title, body, metadata?, email? }} data
 *   email: async function — called fire-and-forget; errors are logged, not thrown
 */
export const createNotification = async (userId, type, { title, body, metadata = null, email = null } = {}) => {
  const notification = await Notification.create({
    userId,
    type,
    title,
    body,
    data: metadata,
  });

  const io = getIO();
  if (io) {
    io.to(`user:${userId}`).emit('new_notification', notification.toJSON());
  }

  if (typeof email === 'function') {
    email().catch((err) => console.error('[notification] Email send failed:', err.message));
  }

  return notification;
};
