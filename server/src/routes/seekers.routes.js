import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  addExperience,
  updateExperience,
  deleteExperience,
  addEducation,
  updateEducation,
  deleteEducation,
  addCertification,
  updateCertification,
  deleteCertification,
  getDashboard,
} from '../controllers/seekers.controller.js';
import {
  uploadResume,
  listResumes,
  deleteResume,
  setDefaultResume,
} from '../controllers/resume.controller.js';
import {
  createAlert,
  listAlerts,
  deleteAlert,
  toggleAlert,
} from '../controllers/alerts.controller.js';
import { resumeUpload } from '../middleware/upload.middleware.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken, authorizeRole('seeker'));

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Experience
router.post('/profile/experience', addExperience);
router.put('/profile/experience/:id', updateExperience);
router.delete('/profile/experience/:id', deleteExperience);

// Education
router.post('/profile/education', addEducation);
router.put('/profile/education/:id', updateEducation);
router.delete('/profile/education/:id', deleteEducation);

// Certifications
router.post('/profile/certifications', addCertification);
router.put('/profile/certifications/:id', updateCertification);
router.delete('/profile/certifications/:id', deleteCertification);

// Dashboard
router.get('/dashboard', getDashboard);

// Resumes
router.post('/resume', resumeUpload, uploadResume);
router.get('/resume', listResumes);
router.delete('/resume/:id', deleteResume);
router.put('/resume/:id/default', setDefaultResume);

// Job alerts
router.post('/alerts', createAlert);
router.get('/alerts', listAlerts);
router.delete('/alerts/:id', deleteAlert);
router.put('/alerts/:id/toggle', toggleAlert);

export default router;
