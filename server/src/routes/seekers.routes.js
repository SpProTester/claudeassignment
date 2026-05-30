import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getPublicProfile,
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
  listTemplates,
  createBuiltResume,
  getResumeById,
  updateBuiltResume,
  exportResumePdf,
} from '../controllers/resume-builder.controller.js';
import {
  createAlert,
  listAlerts,
  deleteAlert,
  toggleAlert,
} from '../controllers/alerts.controller.js';
import { listSavedJobs, saveJob, unsaveJob } from '../controllers/saved-jobs.controller.js';
import { resumeUpload } from '../middleware/upload.middleware.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware.js';

const router = Router();

// ── Public (no auth required) ─────────────────────────────────────────────────
// Must be registered before router.use(authenticateToken) below
router.get('/public/:seekerId', getPublicProfile);

// ── Authenticated seeker-only routes ─────────────────────────────────────────
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

// Resumes — static paths MUST come before /:id
router.get('/resume/templates',     listTemplates);
router.post('/resume/builder',      createBuiltResume);
router.post('/resume',              resumeUpload, uploadResume);
router.get('/resume',               listResumes);
router.get('/resume/:id',           getResumeById);
router.put('/resume/:id',           updateBuiltResume);
router.get('/resume/:id/export',    exportResumePdf);
router.delete('/resume/:id',        deleteResume);
router.put('/resume/:id/default',   setDefaultResume);

// Job alerts
router.post('/alerts', createAlert);
router.get('/alerts', listAlerts);
router.delete('/alerts/:id', deleteAlert);
router.put('/alerts/:id/toggle', toggleAlert);

// Saved jobs
router.get('/saved-jobs', listSavedJobs);
router.post('/saved-jobs/:jobId', saveJob);
router.delete('/saved-jobs/:jobId', unsaveJob);

export default router;
