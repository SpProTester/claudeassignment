import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { applicationsService } from '../services/jobs.service.js';
import { applicationStatusColor, timeAgo } from '../utils/helpers.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'seeker') return;
    applicationsService
      .getMy()
      .then((data) => setApplications(data.applications))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-500 text-sm mt-1 capitalize">Role: {user?.role}</p>
      </div>

      {user?.role === 'seeker' && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-800">My Applications</h2>
            <Link to="/jobs" className="btn-outline text-sm">
              Browse More Jobs
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card animate-pulse h-20 bg-gray-100" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-600">{error}</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-3xl mb-3">📋</p>
              <p className="text-gray-600 font-medium">No applications yet</p>
              <p className="text-sm text-gray-400 mt-1">Start applying to land your dream job!</p>
              <Link to="/jobs" className="btn-primary mt-5 inline-flex">
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="card">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-400 shrink-0">
                      {app.job?.company?.name?.[0] || 'J'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/jobs/${app.job?.id}`}
                        className="font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                      >
                        {app.job?.title}
                      </Link>
                      <p className="text-sm text-gray-500">{app.job?.company?.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`badge ${applicationStatusColor(app.status)} capitalize`}>
                        {app.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(app.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {user?.role === 'employer' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link to="/jobs/my/listings" className="card hover:border-primary-300">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="font-semibold text-gray-900">My Job Listings</h3>
            <p className="text-sm text-gray-500 mt-1">View and manage your posted jobs</p>
          </Link>
          <Link to="/jobs/new" className="card hover:border-primary-300">
            <div className="text-3xl mb-3">➕</div>
            <h3 className="font-semibold text-gray-900">Post a New Job</h3>
            <p className="text-sm text-gray-500 mt-1">Reach thousands of candidates</p>
          </Link>
        </div>
      )}
    </div>
  );
}
