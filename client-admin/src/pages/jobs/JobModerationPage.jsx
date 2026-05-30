import { useState } from 'react';
import { useAdminJobs, useModerateJob, useDeleteJob } from '../../hooks/useAdmin';
import Badge from '../../components/common/Badge';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
  { label: 'Paused', value: 'paused' },
  { label: 'Closed', value: 'closed' },
  { label: 'Expired', value: 'expired' },
];

export default function JobModerationPage() {
  const [filters, setFilters] = useState({ q: '', status: '', page: 1, limit: 20 });
  const [confirm, setConfirm] = useState(null); // { type: 'moderate'|'delete', job, action? }

  const { data, isLoading } = useAdminJobs(filters);
  const moderate = useModerateJob();
  const deleteJob = useDeleteJob();

  const jobs = data?.jobs || [];
  const pagination = data?.pagination;

  const handleConfirm = async () => {
    if (!confirm) return;
    if (confirm.type === 'moderate') {
      await moderate.mutateAsync({ id: confirm.job.id, action: confirm.action });
    } else {
      await deleteJob.mutateAsync(confirm.job.id);
    }
    setConfirm(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">Job Moderation</h2>
        <p className="text-sm text-slate-400 mt-0.5">{pagination?.total?.toLocaleString() ?? '…'} total listings</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilters((f) => ({ ...f, status: tab.value, page: 1 }))}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              filters.status === tab.value
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        className="admin-input w-72"
        placeholder="Search by title…"
        value={filters.q}
        onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value, page: 1 }))}
      />

      {/* Table */}
      <div className="admin-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Status</th>
                <th>Type</th>
                <th>Posted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j}><div className="h-4 bg-slate-800 animate-pulse rounded w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : jobs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-500">No jobs found</td></tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <p className="font-medium text-slate-200 max-w-[200px] truncate">{job.title}</p>
                      <p className="text-xs text-slate-500">{job.slug}</p>
                    </td>
                    <td>
                      <span className="text-sm text-slate-300">{job.employer?.companyName || '—'}</span>
                    </td>
                    <td><Badge label={job.status} /></td>
                    <td>
                      <span className="text-xs text-slate-400">{job.jobType}</span>
                    </td>
                    <td>
                      <span className="text-xs text-slate-400">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {job.status !== 'active' && (
                          <button
                            className="text-xs text-emerald-400 hover:text-emerald-300"
                            onClick={() => setConfirm({ type: 'moderate', job, action: 'activate' })}
                          >
                            Activate
                          </button>
                        )}
                        {job.status === 'active' && (
                          <button
                            className="text-xs text-amber-400 hover:text-amber-300"
                            onClick={() => setConfirm({ type: 'moderate', job, action: 'close' })}
                          >
                            Close
                          </button>
                        )}
                        <button
                          className="text-xs text-red-400 hover:text-red-300"
                          onClick={() => setConfirm({ type: 'delete', job })}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="p-4 border-t border-slate-800">
            <Pagination
              page={filters.page}
              totalPages={pagination.totalPages}
              onPage={(p) => setFilters((f) => ({ ...f, page: p }))}
            />
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!confirm}
        title={confirm?.type === 'delete' ? 'Delete Job Listing' : `${confirm?.action === 'activate' ? 'Activate' : 'Close'} Job`}
        message={
          confirm?.type === 'delete'
            ? `Permanently delete "${confirm?.job?.title}"? This action cannot be undone.`
            : `Change status of "${confirm?.job?.title}" to ${confirm?.action}?`
        }
        confirmLabel={confirm?.type === 'delete' ? 'Delete permanently' : 'Confirm'}
        confirmClass={confirm?.type === 'delete' ? 'admin-btn-danger' : 'admin-btn-primary'}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
