import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  listApplicants,
  updateAtsStage,
  addNote,
  setRating,
  streamResume,
  sendApplicantEmail,
  getJobAnalytics,
  ATS_STAGES,
} from '../controllers/ats.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

// All ATS routes require employer or admin access
router.use(protect, restrictTo('employer', 'admin'));

// ─── Param validators ────────────────────────────────────────────────────────
const appId  = param('id').isUUID(4).withMessage('Application ID must be a valid UUID.');
const jobId  = param('id').isUUID(4).withMessage('Job ID must be a valid UUID.');
const jobIdA = param('jobId').isUUID(4).withMessage('Job ID must be a valid UUID.');

// ─── GET /employer/jobs/:id/applicants ───────────────────────────────────────
// NOTE: mounted at /employer — so the full path is /api/employer/jobs/:id/applicants
// Express resolves /:id/applicants before /:id in employer.jobs.routes because
// this router is mounted AFTER employerJobsRoutes (see routes/index.js).
router.get(
  '/jobs/:id/applicants',
  [
    jobId,
    query('atsStage')
      .optional()
      .isIn(ATS_STAGES)
      .withMessage(`atsStage must be one of: ${ATS_STAGES.join(', ')}.`),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('page must be a positive integer.'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 500 })
      .withMessage('limit must be between 1 and 500.'),
  ],
  validate,
  listApplicants
);

// ─── PUT /employer/applicants/:id/stage ──────────────────────────────────────
router.put(
  '/applicants/:id/stage',
  [
    appId,
    body('stage')
      .isIn(ATS_STAGES)
      .withMessage(`stage must be one of: ${ATS_STAGES.join(', ')}.`),
  ],
  validate,
  updateAtsStage
);

// ─── POST /employer/applicants/:id/note ──────────────────────────────────────
router.post(
  '/applicants/:id/note',
  [
    appId,
    body('note')
      .trim()
      .notEmpty()
      .withMessage('Note content is required.')
      .isLength({ max: 2000 })
      .withMessage('Note must be at most 2 000 characters.'),
  ],
  validate,
  addNote
);

// ─── PUT /employer/applicants/:id/rating ─────────────────────────────────────
router.put(
  '/applicants/:id/rating',
  [
    appId,
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be an integer between 1 and 5.'),
  ],
  validate,
  setRating
);

// ─── GET /employer/applicants/:id/resume ─────────────────────────────────────
// Streams the applicant's resume as a file download.
// No body validators needed — the application ID is sufficient.
router.get('/applicants/:id/resume', appId, validate, streamResume);

// ─── POST /employer/applicants/:id/email ─────────────────────────────────────
router.post(
  '/applicants/:id/email',
  [
    appId,
    body('subject')
      .trim()
      .notEmpty()
      .withMessage('Email subject is required.')
      .isLength({ max: 255 })
      .withMessage('Subject must be at most 255 characters.'),
    body('message')
      .trim()
      .notEmpty()
      .withMessage('Email message is required.')
      .isLength({ max: 5000 })
      .withMessage('Message must be at most 5 000 characters.'),
  ],
  validate,
  sendApplicantEmail
);

// ─── GET /employer/analytics/:jobId ──────────────────────────────────────────
router.get('/analytics/:jobId', jobIdA, validate, getJobAnalytics);

export default router;
