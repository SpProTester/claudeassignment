import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  listNotifications,
  markRead,
  markAllRead,
  deleteNotification,
} from '../controllers/notifications.controller.js';

const router = Router();

router.use(authenticateToken);

router.get('/', listNotifications);
router.put('/read-all', markAllRead);       // before /:id to avoid param capture
router.put('/:id/read', markRead);
router.delete('/:id', deleteNotification);

export default router;
