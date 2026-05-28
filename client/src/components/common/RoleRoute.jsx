import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-9 h-9 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/**
 * Role-based route guard.
 * Usage: <RoleRoute roles={['employer']}><EmployerDashboard /></RoleRoute>
 * Redirects unauthenticated users to /login, wrong-role users to /dashboard.
 */
export default function RoleRoute({ children, roles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
