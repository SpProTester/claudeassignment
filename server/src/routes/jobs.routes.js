import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getCompanyJobs,
} from '../controllers/jobs.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

// Public
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Employer only
router.use(protect, restrictTo('employer', 'admin'));

router.get('/my/listings', getCompanyJobs);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Job title is required.'),
    body('description').trim().notEmpty().withMessage('Description is required.'),
    body('jobType')
      .isIn(['full-time', 'part-time', 'contract', 'remote', 'internship'])
      .withMessage('Invalid job type.'),
  ],
  validate,
  createJob
);

router.patch('/:id', updateJob);
router.delete('/:id', deleteJob);

export default router;
