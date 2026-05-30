import { useState } from 'react';
import { useApplications, useUpdateApplicationStatus } from '../../hooks/useAdmin';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';

const ATS_STAGES = ['', 'applied', 'screening', 'reviewing', 'shortlisted', 'interview', 'offer', 'hired', 'rejected'];

export default function ApplicationsPage() {
  const [filters, setFilters] = useState({ atsStage: '', page: 1, limit: 20 });
  const [editStage, setEditStage] = useState(null); // { appId, current }

  const { data, isLoading } = useApplications(filters);
  const updateStatus = useUpdateApplicationStatus();

  const applications = data?.applications || [];
  const pagination = data?.pagination;

  const handleStageChange = async (appId, atsStage) => {
    await updateStatus.mutateAsync({ id: appId, atsStage });
    setEditStage(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">Applications</h2>
        <p className="text-sm text-slate-400 mt-0.5">{pagination?.total?.toLocaleString() ?? '…'} total applications</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          className="admin-input w-44"
          value={filters.atsStage}
          onChange={(e) => setFilters((f) => ({ ...f, atsStage: e.target.value, page: 1 }))}
        >
          <option value="">All stages</option>
          {ATS_STAGES.slice(1).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="admin-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Job</th>
                <th>Company</th>
                <th>Stage</th>
                <th>Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((__, j) => (
                    <td key={j}><div className="h-4 bg-slate-800 animate-pulse rounded w-24" /></td>
                  ))}</tr>
                ))
              ) : applications.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-500">No applications found</td></tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <p className="font-medium text-slate-200">{app.seeker?.fullName}</p>
                      <p className="text-xs text-slate-500">{app.seeker?.email}</p>
                    </td>
                    <td>
                      <p className="text-sm text-slate-300 max-w-[160px] truncate">{app.job?.title}</p>
                      <p className="text-xs text-slate-500">{app.job?.jobType}</p>
                    </td>
                    <td>
                      <span className="text-sm text-slate-300">{app.job?.employer?.companyName || '—'}</span>
                    </td>
                    <td>
                      {editStage?.appId === app.id ? (
                        <select
                          className="admin-input text-xs py-1 w-32"
                          defaultValue={app.atsStage}
                          autoFocus
                          onBlur={() => setEditStage(null)}
                          onChange={(e) => handleStageChange(app.id, e.target.value)}
                        >
                          {ATS_STAGES.slice(1).map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          className="text-left"
                          onClick={() => setEditStage({ appId: app.id, current: app.atsStage })}
                          title="Click to change stage"
                        >
                          <Badge label={app.atsStage} />
                        </button>
                      )}
                    </td>
                    <td>
                      <span className="text-xs text-slate-400">{new Date(app.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td>
                      <button
                        className="text-xs text-violet-400 hover:text-violet-300"
                        onClick={() => setEditStage({ appId: app.id, current: app.atsStage })}
                      >
                        Edit Stage
                      </button>
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
    </div>
  );
}
