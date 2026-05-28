import { Router } from 'express';
import authRoutes from './auth.routes.js';
import jobRoutes from './jobs.routes.js';
import applicationRoutes from './applications.routes.js';
import companyRoutes from './companies.routes.js';
import seekerRoutes from './seekers.routes.js';
import employerJobsRoutes from './employer.jobs.routes.js';
import atsRoutes from './ats.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/companies', companyRoutes);
router.use('/seekers', seekerRoutes);
// More-specific prefix first so /:id/applicants falls through to atsRoutes
router.use('/employer/jobs', employerJobsRoutes);
router.use('/employer', atsRoutes);

export default router;
