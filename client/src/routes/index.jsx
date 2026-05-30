import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout.jsx';
import ProtectedRoute from '../components/common/ProtectedRoute.jsx';
import RoleRoute from '../components/common/RoleRoute.jsx';
import Home from '../pages/Home.jsx';
import Jobs from '../pages/Jobs.jsx';
import JobDetail from '../pages/JobDetail.jsx';
import CompanyProfile from '../pages/CompanyProfile.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import ResetPassword from '../pages/ResetPassword.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import NotFound from '../pages/NotFound.jsx';
import SeekerLayout from '../components/seeker/SeekerLayout.jsx';
import SeekerDashboard from '../pages/seeker/SeekerDashboard.jsx';
import SeekerProfile from '../pages/seeker/SeekerProfile.jsx';
import SeekerResume from '../pages/seeker/SeekerResume.jsx';
import ResumeBuilder from '../pages/seeker/ResumeBuilder.jsx';
import SeekerApplications from '../pages/seeker/SeekerApplications.jsx';
import SeekerSavedJobs from '../pages/seeker/SeekerSavedJobs.jsx';
import SeekerAlerts from '../pages/seeker/SeekerAlerts.jsx';
import EmployerLayout from '../components/employer/EmployerLayout.jsx';
import EmployerDashboard from '../pages/employer/EmployerDashboard.jsx';
import EmployerJobs from '../pages/employer/EmployerJobs.jsx';
import JobForm from '../pages/employer/JobForm.jsx';
import ApplicantsBoard from '../pages/employer/ApplicantsBoard.jsx';
import EmployerCompany from '../pages/employer/EmployerCompany.jsx';
import BillingPage from '../pages/employer/BillingPage.jsx';
import InvoicesPage from '../pages/employer/InvoicesPage.jsx';
import Pricing from '../pages/Pricing.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Resume Builder (full-screen, no nav/sidebar) ───── */}
      <Route path="/seeker/resume/builder/new" element={<RoleRoute roles={['seeker']}><ResumeBuilder /></RoleRoute>} />
      <Route path="/seeker/resume/:id/edit"    element={<RoleRoute roles={['seeker']}><ResumeBuilder /></RoleRoute>} />

      <Route path="/" element={<Layout />}>
        {/* ── Public ──────────────────────────────────────── */}
        <Route index element={<Home />} />
        <Route path="jobs"                element={<Jobs />} />
        <Route path="jobs/:slug"          element={<JobDetail />} />
        <Route path="companies/:slug"     element={<CompanyProfile />} />
        <Route path="pricing"             element={<Pricing />} />
        <Route path="login"               element={<Login />} />
        <Route path="register"            element={<Register />} />
        <Route path="forgot-password"     element={<ForgotPassword />} />
        <Route path="reset-password"      element={<ResetPassword />} />

        {/* ── Authenticated — any role ─────────────────────── */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ── Employer dashboard ────────────────────────────── */}
        <Route
          path="employer"
          element={
            <RoleRoute roles={['employer', 'admin']}>
              <EmployerLayout />
            </RoleRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"           element={<EmployerDashboard />} />
          <Route path="jobs"                element={<EmployerJobs />} />
          <Route path="jobs/new"            element={<JobForm />} />
          <Route path="jobs/:id/edit"       element={<JobForm />} />
          <Route path="jobs/:id/applicants" element={<ApplicantsBoard />} />
          <Route path="company"             element={<EmployerCompany />} />
          <Route path="billing"             element={<BillingPage />} />
          <Route path="billing/invoices"    element={<InvoicesPage />} />
        </Route>

        {/* ── Seeker dashboard ──────────────────────────────── */}
        <Route
          path="seeker"
          element={
            <RoleRoute roles={['seeker']}>
              <SeekerLayout />
            </RoleRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"           element={<SeekerDashboard />} />
          <Route path="profile"             element={<SeekerProfile />} />
          <Route path="resume"              element={<SeekerResume />} />
          <Route path="applications"        element={<SeekerApplications />} />
          <Route path="saved-jobs"          element={<SeekerSavedJobs />} />
          <Route path="alerts"              element={<SeekerAlerts />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
