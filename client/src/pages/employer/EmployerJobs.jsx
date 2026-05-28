import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employerService } from '../../services/employer.service.js';
import { jobStatusColor, jobStatusLabel, jobTypeBadgeColor, workModeBadgeColor, timeAgo } from '../../utils/helpers.js';
import { toast } from '../../store/uiStore.js';

const STATUS_FILTERS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'paused', label: 'Paused' },
  { value: 'closed', label: 'Closed' },
  { value: 'expired', label: 'Expired' },
];

function ConfirmModal({ job, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-2">Close job listing?</h3>
        <p className="text-sm text-gray-500 mb-5">
          <strong>"{job.title}"</strong> will be set to <em>closed</em> and removed from public listings. This cannot be undone via the UI.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Closing…' : 'Close Job'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusToggle({ job }) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (status) => employerService.changeStatus(job.id, status),
    onSuccess: () => {
      toast.success('Status updated');
      qc.invalidateQueries(['employer', 'jobs']);
    },
    onError: (e) => toast.error(e.message),
  });

  if (job.status === 'closed' || job.status === 'expired') return null;

  const next = job.status === 'active' ? 'paused' : 'active';
  const label = job.status === 'active' ? 'Pause' : 'Activate';

  return (
    <button
      onClick={() => mutation.mutate(next)}
      disabled={mutation.isPending}
      className="text-xs text-gray-500 hover:text-gray-800 underline underline-offset-2 transition-colors disabled:opacity-50"
    >
      {mutation.isPending ? '…' : label}
    </button>
  );
}

export default function EmployerJobs() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [closingJob, setClosingJob] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['employer', 'jobs', statusFilter],
    queryFn: () => employerService.listJobs({ status: statusFilter || undefined, limit: 100 }),
  });

  const closeMutation = useMutation({
    mutationFn: (id) => employerService.closeJob(id),
    onSuccess: () => {
      toast.success('Job closed successfully.');
      setClosingJob(null);
      qc.invalidateQueries(['employer', 'jobs']);
    },
    onError: (e) => toast.error(e.message),
  });

  const jobs = data?.data?.jobs ?? [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Listings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all your posted jobs.</p>
        </div>
        <Link to="/employer/jobs/new" className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Post New Job
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-5 py-4 animate-pulse flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-48" />
                  <div className="h-3 bg-gray-100 rounded w-32" />
                </div>
                <div className="h-5 bg-gray-100 rounded-full w-16" />
                <div className="h-5 bg-gray-100 rounded w-12" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-sm font-semibold text-gray-800">
              {statusFilter ? `No ${statusFilter} jobs found` : 'No jobs posted yet'}
            </p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Post your first job to start receiving applications.</p>
            <Link to="/employer/jobs/new" className="btn-primary text-xs">Post a Job</Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Job Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type / Mode</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Apps</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Views</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Posted</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900 truncate max-w-[200px]">{job.title}</p>
                        {job.location && (
                          <p className="text-xs text-gray-400 mt-0.5">{job.location}</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`badge ${jobTypeBadgeColor(job.jobType)} w-fit`}>{job.jobType}</span>
                          <span className={`badge ${workModeBadgeColor(job.workMode)} w-fit`}>{job.workMode}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`badge ${jobStatusColor(job.status)}`}>{jobStatusLabel(job.status)}</span>
                          <StatusToggle job={job} />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-gray-800">
                        {parseInt(job.applicationsCount, 10) || 0}
                      </td>
                      <td className="px-4 py-4 text-right text-gray-500">
                        {job.viewsCount || 0}
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-400 whitespace-nowrap">
                        {timeAgo(job.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/employer/jobs/${job.id}/applicants`}
                            className="p-1.5 rounded-md text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                            title="View applicants"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                            </svg>
                          </Link>
                          <Link
                            to={`/employer/jobs/${job.id}/edit`}
                            className="p-1.5 rounded-md text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                            title="Edit job"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                            </svg>
                          </Link>
                          {job.status !== 'closed' && (
                            <button
                              onClick={() => setClosingJob(job)}
                              className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Close job"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {jobs.map((job) => (
                <div key={job.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{job.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{timeAgo(job.createdAt)}</p>
                    </div>
                    <span className={`badge ${jobStatusColor(job.status)} shrink-0`}>{jobStatusLabel(job.status)}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`badge ${jobTypeBadgeColor(job.jobType)}`}>{job.jobType}</span>
                    <span className={`badge ${workModeBadgeColor(job.workMode)}`}>{job.workMode}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                    <span>{parseInt(job.applicationsCount, 10) || 0} applicants · {job.viewsCount || 0} views</span>
                    <div className="flex items-center gap-3">
                      <Link to={`/employer/jobs/${job.id}/applicants`} className="text-primary-600 font-medium">Applicants</Link>
                      <Link to={`/employer/jobs/${job.id}/edit`} className="text-gray-600 font-medium">Edit</Link>
                      {job.status !== 'closed' && (
                        <button onClick={() => setClosingJob(job)} className="text-red-500 font-medium">Close</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Confirm close modal */}
      {closingJob && (
        <ConfirmModal
          job={closingJob}
          loading={closeMutation.isPending}
          onConfirm={() => closeMutation.mutate(closingJob.id)}
          onCancel={() => setClosingJob(null)}
        />
      )}
    </div>
  );
}
