import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe, updateProfile } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.post(
  '/register',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required.').isLength({ min: 2 }),
    body('lastName').trim().notEmpty().withMessage('Last name is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters.')
      .matches(/[A-Z]/)
      .withMessage('Password must contain an uppercase letter.')
      .matches(/[0-9]/)
      .withMessage('Password must contain a number.'),
    body('role').optional().isIn(['seeker', 'employer']).withMessage('Role must be seeker or employer.'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  login
);

router.get('/me', protect, getMe);
router.patch('/me', protect, updateProfile);

export default router;
