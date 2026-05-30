import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware.js';
import { adminLogin, adminRefresh, adminLogout, adminMe } from '../controllers/admin.auth.controller.js';
import {
  getStats,
  getUsers,
  getUserById,
  updateUserStatus,
  getEmployers,
  getEmployerById,
  verifyEmployer,
  assignEmployerPlan,
  getJobs,
  moderateJob,
  deleteJob,
  getApplications,
  updateApplicationStatus,
  getSubscriptions,
  getPayments,
  getReports,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAdminUsers,
  createAdminUser,
  getAuditLog,
  getSearchTrends,
  broadcastNotification,
} from '../controllers/admin.controller.js';

const router = Router();
const adminOnly = [authenticateToken, authorizeRole('admin')];

// ── Auth ─────────────────────────────────────────────────────────────────────
router.post('/auth/login', adminLogin);
router.post('/auth/refresh', adminRefresh);
router.post('/auth/logout', adminLogout);
router.get('/auth/me', ...adminOnly, adminMe);

// ── Platform Stats ────────────────────────────────────────────────────────────
router.get('/stats', ...adminOnly, getStats);
router.get('/stats/search-trends', ...adminOnly, getSearchTrends);

// ── Users (all roles) ─────────────────────────────────────────────────────────
router.get('/users', ...adminOnly, getUsers);
router.get('/users/:id', ...adminOnly, getUserById);
router.patch('/users/:id/status', ...adminOnly, updateUserStatus);

// ── Employer Management ───────────────────────────────────────────────────────
router.get('/employers', ...adminOnly, getEmployers);
router.get('/employers/:id', ...adminOnly, getEmployerById);
router.patch('/employers/:id/verify', ...adminOnly, verifyEmployer);
router.patch('/employers/:id/plan', ...adminOnly, assignEmployerPlan);

// ── Jobs ──────────────────────────────────────────────────────────────────────
router.get('/jobs', ...adminOnly, getJobs);
router.patch('/jobs/:id/moderate', ...adminOnly, moderateJob);
router.delete('/jobs/:id', ...adminOnly, deleteJob);

// ── Applications ──────────────────────────────────────────────────────────────
router.get('/applications', ...adminOnly, getApplications);
router.patch('/applications/:id/status', ...adminOnly, updateApplicationStatus);

// ── Subscriptions & Payments ──────────────────────────────────────────────────
router.get('/subscriptions', ...adminOnly, getSubscriptions);
router.get('/payments', ...adminOnly, getPayments);

// ── Reports ───────────────────────────────────────────────────────────────────
router.get('/reports', ...adminOnly, getReports);

// ── Categories ────────────────────────────────────────────────────────────────
router.get('/categories', ...adminOnly, getCategories);
router.post('/categories', ...adminOnly, createCategory);
router.put('/categories/:id', ...adminOnly, updateCategory);
router.delete('/categories/:id', ...adminOnly, deleteCategory);

// ── Admin User Management ─────────────────────────────────────────────────────
router.get('/settings/admins', ...adminOnly, getAdminUsers);
router.post('/settings/admins', ...adminOnly, createAdminUser);
router.patch('/settings/admins/:id/status', ...adminOnly, updateUserStatus); // reuse updateUserStatus

// ── Audit Log ─────────────────────────────────────────────────────────────────
router.get('/audit-log', ...adminOnly, getAuditLog);

// ── Broadcast ─────────────────────────────────────────────────────────────────
router.post('/broadcast', ...adminOnly, broadcastNotification);

export default router;
