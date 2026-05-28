import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'seeker') {
    return <Navigate to="/seeker/dashboard" replace />;
  }

  if (user?.role === 'employer') {
    return <Navigate to="/employer/dashboard" replace />;
  }

  return <Navigate to="/" replace />;
}
