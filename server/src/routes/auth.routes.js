import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

// ── Public ─────────────────────────────────────────────────────────────────

router.post(
  '/register',
  [
    body('fullName')
      .trim()
      .notEmpty()
      .withMessage('Full name is required.')
      .isLength({ min: 2, max: 200 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters.')
      .matches(/[A-Z]/)
      .withMessage('Password must contain an uppercase letter.')
      .matches(/[0-9]/)
      .withMessage('Password must contain a number.'),
    body('role')
      .optional()
      .isIn(['seeker', 'employer'])
      .withMessage('Role must be seeker or employer.'),
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

router.post('/refresh', refresh);

router.post('/logout', logout);

router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email required.')],
  validate,
  forgotPassword
);

router.post(
  '/reset-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
    body('otp')
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('OTP must be a 6-digit number.'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters.')
      .matches(/[A-Z]/)
      .withMessage('Password must contain an uppercase letter.')
      .matches(/[0-9]/)
      .withMessage('Password must contain a number.'),
  ],
  validate,
  resetPassword
);

// ── Protected ──────────────────────────────────────────────────────────────

router.get('/me', authenticateToken, getMe);
router.patch('/me', authenticateToken, updateProfile);

export default router;
