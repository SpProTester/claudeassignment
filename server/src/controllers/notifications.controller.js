import { Notification } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';

export const listNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const parsedPage  = Math.max(1, parseInt(page, 10));
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const offset = (parsedPage - 1) * parsedLimit;

    const [{ count, rows: notifications }, unreadCount] = await Promise.all([
      Notification.findAndCountAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: parsedLimit,
        offset,
      }),
      Notification.count({ where: { userId: req.user.id, isRead: false } }),
    ]);

    sendSuccess(res, {
      notifications,
      unreadCount,
      pagination: {
        total: count,
        page: parsedPage,
        pages: Math.ceil(count / parsedLimit),
        limit: parsedLimit,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!notification) return sendError(res, 'Notification not found.', 404);

    await notification.update({ isRead: true, readAt: new Date() });
    sendSuccess(res, { notification }, 'Notification marked as read.');
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId: req.user.id, isRead: false } }
    );
    sendSuccess(res, null, 'All notifications marked as read.');
  } catch (err) {
    next(err);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const deleted = await Notification.destroy({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!deleted) return sendError(res, 'Notification not found.', 404);
    sendSuccess(res, null, 'Notification deleted.');
  } catch (err) {
    next(err);
  }
};
