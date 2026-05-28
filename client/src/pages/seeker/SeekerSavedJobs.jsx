import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { seekerService } from '../../services/seeker.service.js';
import { jobTypeBadgeColor, formatSalary, timeAgo } from '../../utils/helpers.js';
import { toast } from '../../store/uiStore.js';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-100 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 rounded w-40" />
          <div className="h-3 bg-gray-100 rounded w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
      </div>
    </div>
  );
}

function SavedJobCard({ savedJob, onUnsave, isRemoving }) {
  const job = savedJob.job ?? savedJob;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div className="p-5 flex-1">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
            {job.employer?.companyName?.[0] ?? 'J'}
          </div>
          <div className="min-w-0 flex-1">
            <Link
              to={`/jobs/${job.id}`}
              className="font-semibold text-gray-900 hover:text-primary-600 transition-colors text-sm leading-snug line-clamp-2"
            >
              {job.title}
            </Link>
            <p className="text-xs text-gray-500 mt-0.5">{job.employer?.companyName}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {job.jobType && (
            <span className={`badge ${jobTypeBadgeColor(job.jobType)}`}>{job.jobType}</span>
          )}
          {job.workMode && (
            <span className="badge bg-gray-100 text-gray-600 capitalize">{job.workMode}</span>
          )}
          {job.experienceLevel && (
            <span className="badge bg-gray-100 text-gray-600 capitalize">{job.experienceLevel}</span>
          )}
        </div>

        {/* Location & salary */}
        <div className="space-y-1">
          {job.location && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {job.location}
            </p>
          )}
          {(job.salaryMin || job.salaryMax) && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatSalary(job.salaryMin, job.salaryMax)}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between">
        <span className="text-xs text-gray-400">{timeAgo(savedJob.createdAt ?? job.createdAt)}</span>
        <div className="flex items-center gap-3">
          <Link to={`/jobs/${job.id}`} className="text-xs font-medium text-primary-600 hover:text-primary-700">
            View
          </Link>
          <button
            onClick={onUnsave}
            disabled={isRemoving}
            className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
          >
            {isRemoving ? 'Removing…' : 'Unsave'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SeekerSavedJobs() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['seeker', 'saved-jobs'],
    queryFn: seekerService.getSavedJobs,
    retry: false,
  });

  const unsaveMutation = useMutation({
    mutationFn: (jobId) => seekerService.unsaveJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker', 'saved-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['seeker', 'dashboard'] });
      toast.success('Job removed from saved list.');
    },
    onError: (err) => toast.error(err.message),
  });

  const savedJobs = data?.savedJobs ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
        <p className="text-sm text-gray-500 mt-1">Jobs you've bookmarked for later.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-3xl mb-3">🔖</p>
          <p className="text-sm font-medium text-gray-700">Saved jobs unavailable</p>
          <p className="text-xs text-gray-400 mt-1">This feature is coming soon.</p>
          <Link to="/jobs" className="btn-primary mt-4 inline-flex text-sm">Browse Jobs</Link>
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-3xl mb-3">🔖</p>
          <p className="text-sm font-medium text-gray-700">No saved jobs yet</p>
          <p className="text-xs text-gray-400 mt-1">Save jobs while browsing to revisit them here.</p>
          <Link to="/jobs" className="btn-primary mt-4 inline-flex text-sm">Browse Jobs</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedJobs.map((savedJob) => (
            <SavedJobCard
              key={savedJob.id}
              savedJob={savedJob}
              onUnsave={() => unsaveMutation.mutate(savedJob.jobId ?? savedJob.job?.id)}
              isRemoving={unsaveMutation.isPending && unsaveMutation.variables === (savedJob.jobId ?? savedJob.job?.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
