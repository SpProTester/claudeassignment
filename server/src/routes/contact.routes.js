import { Router } from 'express';
import { body } from 'express-validator';
import { submitContact } from '../controllers/contact.controller.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 200 }),
    body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('subject').trim().notEmpty().withMessage('Subject is required.').isLength({ max: 255 }),
    body('message').trim().notEmpty().withMessage('Message is required.').isLength({ max: 5000 }),
  ],
  validate,
  submitContact
);

export default router;
