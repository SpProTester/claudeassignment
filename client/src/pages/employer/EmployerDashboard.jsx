import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { employerService } from '../../services/employer.service.js';
import { jobStatusColor, jobStatusLabel, timeAgo } from '../../utils/helpers.js';
import StatsCard from '../../components/seeker/StatsCard.jsx';

// ── Icons ─────────────────────────────────────────────────────────────────────
const icons = {
  jobs: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  applicants: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  views: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  draft: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  ),
};

function Skeleton() {
  return (
    <div className="animate-pulse flex items-center gap-4 px-5 py-4">
      <div className="w-9 h-9 bg-gray-100 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-100 rounded w-48" />
        <div className="h-3 bg-gray-100 rounded w-28" />
      </div>
      <div className="h-5 bg-gray-100 rounded-full w-16" />
    </div>
  );
}

export default function EmployerDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['employer', 'jobs'],
    queryFn: () => employerService.listJobs({ limit: 100 }),
  });

  const jobs = data?.data?.jobs ?? [];

  const stats = {
    activeJobs:      jobs.filter((j) => j.status === 'active').length,
    totalApplicants: jobs.reduce((s, j) => s + (parseInt(j.applicationsCount, 10) || 0), 0),
    totalViews:      jobs.reduce((s, j) => s + (j.viewsCount || 0), 0),
    draftJobs:       jobs.filter((j) => j.status === 'draft').length,
  };

  // 6 most recent jobs for the activity feed
  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 6);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview of your hiring activity.</p>
        </div>
        <Link to="/employer/jobs/new" className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Post a Job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Active Jobs"      value={stats.activeJobs}      icon={icons.jobs}       color="blue"   loading={isLoading} />
        <StatsCard label="Total Applicants" value={stats.totalApplicants} icon={icons.applicants} color="green"  loading={isLoading} />
        <StatsCard label="Total Views"      value={stats.totalViews}      icon={icons.views}      color="purple" loading={isLoading} />
        <StatsCard label="Draft Jobs"       value={stats.draftJobs}       icon={icons.draft}      color="orange" loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Jobs</h2>
            <Link to="/employer/jobs" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              View all →
            </Link>
          </div>

          {isLoading ? (
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="text-center py-14">
              <p className="text-3xl mb-3">📋</p>
              <p className="text-sm font-semibold text-gray-800">No jobs posted yet</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">Post your first job to start receiving applications.</p>
              <Link to="/employer/jobs/new" className="btn-primary text-xs">Post a Job</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-sm shrink-0">
                    {job.title?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/employer/jobs/${job.id}/applicants`}
                      className="text-sm font-semibold text-gray-900 hover:text-primary-600 truncate block"
                    >
                      {job.title}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {parseInt(job.applicationsCount, 10) || 0} applicants · {job.viewsCount || 0} views · {timeAgo(job.updatedAt)}
                    </p>
                  </div>
                  <span className={`badge ${jobStatusColor(job.status)} shrink-0`}>
                    {jobStatusLabel(job.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                to="/employer/jobs/new"
                className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-primary-300 text-primary-600 hover:bg-primary-50 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Post a new job
              </Link>
              <Link
                to="/employer/jobs"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                Manage job listings
              </Link>
              <Link
                to="/employer/company"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
                Edit company profile
              </Link>
            </div>
          </div>

          {/* Top performing job */}
          {jobs.length > 0 && (() => {
            const top = [...jobs].sort((a, b) => (parseInt(b.applicationsCount, 10) || 0) - (parseInt(a.applicationsCount, 10) || 0))[0];
            return (
              <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5">
                <h2 className="font-semibold text-gray-900 mb-3 text-sm">Top Job by Applications</h2>
                <p className="text-sm font-medium text-gray-800 truncate">{top.title}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span>{parseInt(top.applicationsCount, 10) || 0} applicants</span>
                  <span>{top.viewsCount || 0} views</span>
                </div>
                <Link
                  to={`/employer/jobs/${top.id}/applicants`}
                  className="mt-3 block text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Review applicants →
                </Link>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
