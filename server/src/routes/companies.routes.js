import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  getMyCompany,
} from '../controllers/companies.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

// Public
router.get('/', getAllCompanies);
router.get('/:id', getCompanyById);

// Employer only
router.use(protect, restrictTo('employer', 'admin'));

router.get('/my/profile', getMyCompany);

router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Company name is required.')],
  validate,
  createCompany
);

router.patch('/:id', updateCompany);

export default router;
