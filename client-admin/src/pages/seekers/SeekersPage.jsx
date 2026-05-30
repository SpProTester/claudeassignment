import { useState } from 'react';
import { useUsers, useUser, useUpdateUserStatus, useApplications } from '../../hooks/useAdmin';
import Badge from '../../components/common/Badge';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';

function SeekerDetailPanel({ seekerId, onClose, onStatusToggle }) {
  const { data, isLoading } = useUser(seekerId);
  const { data: appsData } = useApplications({ seekerId, limit: 20 });

  const { user, stats } = data || {};
  const applications = appsData?.applications || [];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      <aside className="w-[520px] bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
          <div>
            <h3 className="text-base font-semibold text-white">{isLoading ? '…' : user?.fullName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl leading-none">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !user ? (
            <p className="text-slate-500 text-sm text-center">Seeker not found</p>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-white">{stats?.totalApplications ?? 0}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Total Applications</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-white">{applications.length}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Recent (20)</p>
                </div>
              </div>

              {/* Profile */}
              <div className="admin-card space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Profile</h4>
                <InfoRow label="Headline" value={user.seekerProfile?.headline || '—'} />
                <InfoRow label="Account" value={<Badge label={user.isActive ? 'active' : 'inactive'} />} />
                <InfoRow label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {user.isActive ? (
                  <button
                    onClick={() => onStatusToggle({ id: user.id, isActive: false, name: user.fullName })}
                    className="admin-btn-danger text-xs"
                  >
                    Deactivate Account
                  </button>
                ) : (
                  <button
                    onClick={() => onStatusToggle({ id: user.id, isActive: true, name: user.fullName })}
                    className="admin-btn-primary text-xs"
                  >
                    Activate Account
                  </button>
                )}
              </div>

              {/* Applied jobs */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Applied Jobs</h4>
                {applications.length === 0 ? (
                  <p className="text-slate-500 text-sm">No applications yet</p>
                ) : (
                  <div className="space-y-2">
                    {applications.map((app) => (
                      <div key={app.id} className="bg-slate-800 rounded-lg px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-200">{app.job?.title}</p>
                            <p className="text-xs text-slate-500">{app.job?.employer?.companyName} · {new Date(app.createdAt).toLocaleDateString()}</p>
                          </div>
                          <Badge label={app.atsStage} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-200">{value}</span>
    </div>
  );
}

export default function SeekersPage() {
  const [filters, setFilters] = useState({ q: '', role: 'seeker', status: '', page: 1, limit: 20 });
  const [selectedId, setSelectedId] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const { data, isLoading } = useUsers(filters);
  const updateStatus = useUpdateUserStatus();

  const seekers = data?.users || [];
  const pagination = data?.pagination;

  const confirmAction = async () => {
    if (!confirm) return;
    await updateStatus.mutateAsync({ id: confirm.id, isActive: confirm.isActive });
    setConfirm(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">Job Seekers</h2>
        <p className="text-sm text-slate-400 mt-0.5">{pagination?.total?.toLocaleString() ?? '…'} total seekers</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          className="admin-input w-64"
          placeholder="Search by name or email…"
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value, page: 1 }))}
        />
        <select
          className="admin-input w-36"
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="admin-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Seeker</th>
                <th>Headline</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 5 }).map((__, j) => (
                    <td key={j}><div className="h-4 bg-slate-800 animate-pulse rounded w-24" /></td>
                  ))}</tr>
                ))
              ) : seekers.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-500">No seekers found</td></tr>
              ) : (
                seekers.map((seeker) => (
                  <tr key={seeker.id}>
                    <td>
                      <p className="font-medium text-slate-200">{seeker.fullName}</p>
                      <p className="text-xs text-slate-500">{seeker.email}</p>
                    </td>
                    <td>
                      <span className="text-xs text-slate-400">{seeker.seekerProfile?.headline || '—'}</span>
                    </td>
                    <td><Badge label={seeker.isActive ? 'active' : 'inactive'} /></td>
                    <td>
                      <span className="text-xs text-slate-400">{new Date(seeker.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          className="text-xs text-violet-400 hover:text-violet-300"
                          onClick={() => setSelectedId(seeker.id)}
                        >
                          View
                        </button>
                        <button
                          className={`text-xs ${seeker.isActive ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'}`}
                          onClick={() => setConfirm({ id: seeker.id, isActive: !seeker.isActive, name: seeker.fullName })}
                        >
                          {seeker.isActive ? 'Deactivate' : 'Activate'}
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

      {selectedId && (
        <SeekerDetailPanel
          seekerId={selectedId}
          onClose={() => setSelectedId(null)}
          onStatusToggle={(item) => { setSelectedId(null); setConfirm(item); }}
        />
      )}

      <ConfirmModal
        open={!!confirm}
        title={confirm?.isActive ? 'Activate Seeker' : 'Deactivate Seeker'}
        message={
          confirm?.isActive
            ? `Allow ${confirm?.name} to log in again?`
            : `Deactivate ${confirm?.name}? All active sessions will be revoked.`
        }
        confirmLabel={confirm?.isActive ? 'Activate' : 'Deactivate'}
        confirmClass={confirm?.isActive ? 'admin-btn-primary' : 'admin-btn-danger'}
        onConfirm={confirmAction}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
