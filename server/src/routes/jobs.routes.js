import { Router } from 'express';
import { body } from 'express-validator';

import {
  searchJobs,
  getJobBySlug,
  getCategories,
  getTrendingKeywords,
} from '../controllers/job.search.controller.js';

import {
  createJob,
  updateJob,
  deleteJob,
  getCompanyJobs,
} from '../controllers/jobs.controller.js';

import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

/* ── Public search & discovery ──────────────────────────────────
   Order matters: literal paths (categories, trending) must come
   before the /:slug param route or Express would capture them.   */
router.get('/', searchJobs);
router.get('/categories', getCategories);
router.get('/trending', getTrendingKeywords);
router.get('/:slug', getJobBySlug);

/* ── Employer / admin only ──────────────────────────────────── */
router.use(protect, restrictTo('employer', 'admin'));

router.get('/my/listings', getCompanyJobs);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Job title is required.'),
    body('description').trim().notEmpty().withMessage('Description is required.'),
    body('jobType')
      .isIn(['full-time', 'part-time', 'contract', 'freelance', 'internship'])
      .withMessage('Invalid job type.'),
  ],
  validate,
  createJob,
);

router.patch('/:id', updateJob);
router.delete('/:id', deleteJob);

export default router;
