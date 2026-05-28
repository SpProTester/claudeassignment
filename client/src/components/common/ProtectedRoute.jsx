import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-9 h-9 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
