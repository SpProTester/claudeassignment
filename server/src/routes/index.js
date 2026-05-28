import { Router } from 'express';
import authRoutes from './auth.routes.js';
import jobRoutes from './jobs.routes.js';
import applicationRoutes from './applications.routes.js';
import companyRoutes from './companies.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/companies', companyRoutes);

export default router;
