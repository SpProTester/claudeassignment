import { Routes, Route, Navigate } from 'react-router-dom';
import AdminProtectedRoute from '../components/common/AdminProtectedRoute';
import AdminLayout from '../components/layout/AdminLayout';

import AdminLogin from '../pages/AdminLogin';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import UsersPage from '../pages/users/UsersPage';
import EmployersPage from '../pages/employers/EmployersPage';
import SeekersPage from '../pages/seekers/SeekersPage';
import JobModerationPage from '../pages/jobs/JobModerationPage';
import ApplicationsPage from '../pages/applications/ApplicationsPage';
import SubscriptionsPage from '../pages/subscriptions/SubscriptionsPage';
import ReportsPage from '../pages/reports/ReportsPage';
import AnalyticsPage from '../pages/analytics/AnalyticsPage';
import AuditLogPage from '../pages/audit/AuditLogPage';
import CategoriesPage from '../pages/settings/CategoriesPage';
import AdminUsersPage from '../pages/settings/AdminUsersPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<AdminLogin />} />

      {/* Protected — all admin pages share AdminLayout */}
      <Route
        path="/"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />

        {/* Users */}
        <Route path="employers" element={<EmployersPage />} />
        <Route path="seekers" element={<SeekersPage />} />
        <Route path="users" element={<UsersPage />} />

        {/* Content */}
        <Route path="jobs" element={<JobModerationPage />} />
        <Route path="applications" element={<ApplicationsPage />} />

        {/* Billing */}
        <Route path="subscriptions" element={<SubscriptionsPage />} />

        {/* Insights */}
        <Route path="reports" element={<ReportsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />

        {/* System */}
        <Route path="audit-log" element={<AuditLogPage />} />
        <Route path="settings/categories" element={<CategoriesPage />} />
        <Route path="settings/admins" element={<AdminUsersPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
