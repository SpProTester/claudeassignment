import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { seekerService } from '../../services/seeker.service.js';
import { jobsService } from '../../services/jobs.service.js';
import StatsCard from '../../components/seeker/StatsCard.jsx';
import { atsStageColor, atsStageLabel, timeAgo, truncate, jobTypeBadgeColor } from '../../utils/helpers.js';

// ── Stat icons ────────────────────────────────────────────────────────────────
const icons = {
  applied: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    </svg>
  ),
  shortlisted: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  saved: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
  ),
  views: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 animate-pulse p-4">
      <div className="w-10 h-10 bg-gray-100 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-100 rounded w-48" />
        <div className="h-3 bg-gray-100 rounded w-32" />
      </div>
      <div className="h-5 bg-gray-100 rounded-full w-20" />
    </div>
  );
}

function JobCard({ job }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block p-4 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{job.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{job.employer?.companyName}</p>
        </div>
        <span className={`badge ${jobTypeBadgeColor(job.jobType)} shrink-0`}>
          {job.jobType}
        </span>
      </div>
      {job.location && (
        <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {job.location}
        </p>
      )}
    </Link>
  );
}

export default function SeekerDashboard() {
  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ['seeker', 'dashboard'],
    queryFn: seekerService.getDashboard,
  });

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['applications', 'my'],
    queryFn: seekerService.getMyApplications,
  });

  const { data: jobsData } = useQuery({
    queryKey: ['jobs', 'recommended'],
    queryFn: () => jobsService.getAll({ limit: 6 }).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const stats = dashData?.stats;
  const recentApps = (appsData?.applications ?? []).slice(0, 5);
  const recommendedJobs = jobsData?.jobs ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Track your job search activity at a glance.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Applied" value={stats?.totalApplications} icon={icons.applied} color="blue" loading={dashLoading} />
        <StatsCard label="Shortlisted" value={stats?.shortlistedCount} icon={icons.shortlisted} color="green" loading={dashLoading} />
        <StatsCard label="Saved Jobs" value={stats?.savedJobsCount} icon={icons.saved} color="purple" loading={dashLoading} />
        <StatsCard label="Profile Views" value={stats?.profileViews} icon={icons.views} color="orange" loading={dashLoading} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Recent Applications */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Applications</h2>
            <Link to="/seeker/applications" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              View all →
            </Link>
          </div>

          {appsLoading ? (
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : recentApps.length === 0 ? (
            <div className="text-center py-14">
              <p className="text-2xl mb-2">📋</p>
              <p className="text-sm font-medium text-gray-700">No applications yet</p>
              <p className="text-xs text-gray-400 mt-1">Start applying to your dream jobs!</p>
              <Link to="/jobs" className="btn-primary mt-4 inline-flex text-xs">Browse Jobs</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentApps.map((app) => (
                <div key={app.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-400 shrink-0">
                    {app.job?.employer?.companyName?.[0] ?? 'J'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/jobs/${app.job?.id}`} className="text-sm font-semibold text-gray-900 hover:text-primary-600 truncate block">
                      {app.job?.title ?? 'Untitled Job'}
                    </Link>
                    <p className="text-xs text-gray-500">{app.job?.employer?.companyName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`badge ${atsStageColor(app.atsStage)}`}>
                      {atsStageLabel(app.atsStage)}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(app.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Jobs */}
        <div className="w-full lg:w-80 shrink-0 bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recommended</h2>
            <Link to="/jobs" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              Browse all →
            </Link>
          </div>
          {recommendedJobs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-gray-400">No jobs available</p>
            </div>
          ) : (
            <div>
              {recommendedJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
