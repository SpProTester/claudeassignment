import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createEmployerJob,
  listEmployerJobs,
  getEmployerJob,
  updateEmployerJob,
  softDeleteJob,
  changeJobStatus,
} from '../controllers/employer.jobs.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

// All employer job routes require authentication and employer/admin role
router.use(protect, restrictTo('employer', 'admin'));

// ─── Enum value sets ────────────────────────────────────────────────────────
const JOB_TYPES = ['full-time', 'part-time', 'contract', 'freelance', 'internship'];
const WORK_MODES = ['onsite', 'remote', 'hybrid'];
const EXP_LEVELS = ['entry', 'mid', 'senior', 'lead', 'executive'];
const MUTABLE_STATUSES = ['draft', 'active', 'paused', 'closed'];

// ─── Reusable param validator ────────────────────────────────────────────────
const idParam = param('id').isUUID(4).withMessage('Job ID must be a valid UUID.');

// ─── Create validators (all required fields) ────────────────────────────────
const createValidators = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be 5–200 characters.'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required.'),
  body('jobType')
    .isIn(JOB_TYPES).withMessage(`jobType must be one of: ${JOB_TYPES.join(', ')}.`),
  body('workMode')
    .isIn(WORK_MODES).withMessage(`workMode must be one of: ${WORK_MODES.join(', ')}.`),
  body('experienceLevel')
    .isIn(EXP_LEVELS).withMessage(`experienceLevel must be one of: ${EXP_LEVELS.join(', ')}.`),
  body('location')
    .optional({ nullable: true }).trim()
    .isLength({ max: 255 }).withMessage('Location must be at most 255 characters.'),
  body('salaryMin')
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage('salaryMin must be a non-negative integer.'),
  body('salaryMax')
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage('salaryMax must be a non-negative integer.')
    .custom((val, { req }) => {
      if (val !== null && req.body.salaryMin !== undefined && val < req.body.salaryMin) {
        throw new Error('salaryMax must be greater than or equal to salaryMin.');
      }
      return true;
    }),
  body('expiresAt')
    .optional({ nullable: true })
    .isISO8601().toDate().withMessage('expiresAt must be a valid ISO 8601 date.')
    .custom((val) => {
      if (val && val <= new Date()) throw new Error('expiresAt must be a future date.');
      return true;
    }),
  body('skillIds')
    .optional().isArray().withMessage('skillIds must be an array.'),
  body('skillIds.*')
    .optional().isUUID(4).withMessage('Each skill ID must be a valid UUID.'),
];

// ─── Update validators (all fields optional) ────────────────────────────────
const updateValidators = [
  body('title')
    .optional().trim()
    .isLength({ min: 5, max: 200 }).withMessage('Title must be 5–200 characters.'),
  body('description')
    .optional().trim()
    .notEmpty().withMessage('Description cannot be empty.'),
  body('jobType')
    .optional().isIn(JOB_TYPES).withMessage(`jobType must be one of: ${JOB_TYPES.join(', ')}.`),
  body('workMode')
    .optional().isIn(WORK_MODES).withMessage(`workMode must be one of: ${WORK_MODES.join(', ')}.`),
  body('experienceLevel')
    .optional().isIn(EXP_LEVELS).withMessage(`experienceLevel must be one of: ${EXP_LEVELS.join(', ')}.`),
  body('location')
    .optional({ nullable: true }).trim()
    .isLength({ max: 255 }).withMessage('Location must be at most 255 characters.'),
  body('salaryMin')
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage('salaryMin must be a non-negative integer.'),
  body('salaryMax')
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage('salaryMax must be a non-negative integer.')
    .custom((val, { req }) => {
      if (val !== null && req.body.salaryMin !== undefined && val < req.body.salaryMin) {
        throw new Error('salaryMax must be greater than or equal to salaryMin.');
      }
      return true;
    }),
  body('expiresAt')
    .optional({ nullable: true })
    .isISO8601().toDate().withMessage('expiresAt must be a valid ISO 8601 date.')
    .custom((val) => {
      if (val && val <= new Date()) throw new Error('expiresAt must be a future date.');
      return true;
    }),
  body('skillIds')
    .optional().isArray().withMessage('skillIds must be an array.'),
  body('skillIds.*')
    .optional().isUUID(4).withMessage('Each skill ID must be a valid UUID.'),
];

// ─── Routes ──────────────────────────────────────────────────────────────────

// PUT /:id/status must be registered BEFORE /:id to prevent Express matching
// "status" as the :id segment on the generic route
router.put(
  '/:id/status',
  [
    idParam,
    body('status')
      .isIn(MUTABLE_STATUSES)
      .withMessage(`status must be one of: ${MUTABLE_STATUSES.join(', ')}.`),
  ],
  validate,
  changeJobStatus
);

router.post('/', createValidators, validate, createEmployerJob);

router.get(
  '/',
  query('status')
    .optional()
    .isIn([...MUTABLE_STATUSES, 'expired'])
    .withMessage('Invalid status filter.'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100.'),
  validate,
  listEmployerJobs
);

router.get('/:id', idParam, validate, getEmployerJob);

router.put('/:id', [idParam, ...updateValidators], validate, updateEmployerJob);

router.delete('/:id', idParam, validate, softDeleteJob);

export default router;
