import { Router } from 'express';
import {
  applyToJob,
  getMyApplications,
  withdrawApplication,
  getJobApplications,
  updateApplicationStatus,
} from '../controllers/applications.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

// Seeker
router.post('/job/:jobId', restrictTo('seeker'), applyToJob);
router.get('/my', restrictTo('seeker'), getMyApplications);
router.delete('/:id', restrictTo('seeker'), withdrawApplication);

// Employer / Admin
router.get('/job/:jobId', restrictTo('employer', 'admin'), getJobApplications);
router.patch('/:id/status', restrictTo('employer', 'admin'), updateApplicationStatus);

export default router;
