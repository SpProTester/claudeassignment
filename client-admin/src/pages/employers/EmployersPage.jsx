import { useState } from 'react';
import { useEmployers, useVerifyEmployer, useUpdateUserStatus } from '../../hooks/useAdmin';
import Badge from '../../components/common/Badge';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';
import EmployerDetailPanel from './EmployerDetailPanel';

const PLAN_OPTIONS = ['', 'free', 'starter', 'professional', 'business'];
const STATUS_OPTIONS = ['', 'active', 'canceled', 'past_due', 'trialing'];

export default function EmployersPage() {
  const [filters, setFilters] = useState({ q: '', subscriptionPlan: '', subscriptionStatus: '', isVerified: '', page: 1, limit: 20 });
  const [selectedId, setSelectedId] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const { data, isLoading } = useEmployers(filters);
  const verifyMut = useVerifyEmployer();
  const statusMut = useUpdateUserStatus();

  const employers = data?.employers || [];
  const pagination = data?.pagination;

  const runConfirm = async () => {
    if (!confirm) return;
    if (confirm.type === 'verify') {
      await verifyMut.mutateAsync({ id: confirm.id, isVerified: confirm.isVerified });
    } else {
      await statusMut.mutateAsync({ id: confirm.userId, isActive: confirm.isActive });
    }
    setConfirm(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Employers</h2>
          <p className="text-sm text-slate-400 mt-0.5">{pagination?.total?.toLocaleString() ?? '…'} total employers</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          className="admin-input w-60"
          placeholder="Search by company name…"
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value, page: 1 }))}
        />
        <select
          className="admin-input w-40"
          value={filters.subscriptionPlan}
          onChange={(e) => setFilters((f) => ({ ...f, subscriptionPlan: e.target.value, page: 1 }))}
        >
          <option value="">All plans</option>
          {PLAN_OPTIONS.slice(1).map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          className="admin-input w-40"
          value={filters.subscriptionStatus}
          onChange={(e) => setFilters((f) => ({ ...f, subscriptionStatus: e.target.value, page: 1 }))}
        >
          <option value="">All sub statuses</option>
          {STATUS_OPTIONS.slice(1).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          className="admin-input w-36"
          value={filters.isVerified}
          onChange={(e) => setFilters((f) => ({ ...f, isVerified: e.target.value, page: 1 }))}
        >
          <option value="">Verified?</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
      </div>

      {/* Table */}
      <div className="admin-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Plan</th>
                <th>Sub Status</th>
                <th>Jobs</th>
                <th>Verified</th>
                <th>Account</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 8 }).map((__, j) => (
                    <td key={j}><div className="h-4 bg-slate-800 animate-pulse rounded w-20" /></td>
                  ))}</tr>
                ))
              ) : employers.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-500">No employers found</td></tr>
              ) : (
                employers.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <p className="font-medium text-slate-200">{emp.companyName}</p>
                      <p className="text-xs text-slate-500">{emp.industry || '—'}</p>
                    </td>
                    <td>
                      <p className="text-sm text-slate-300">{emp.user?.fullName}</p>
                      <p className="text-xs text-slate-500">{emp.user?.email}</p>
                    </td>
                    <td><Badge label={emp.subscriptionPlan} /></td>
                    <td><Badge label={emp.subscriptionStatus || 'none'} /></td>
                    <td>
                      <span className="text-xs text-slate-300">
                        {emp.activeJobCount ?? 0} / {emp.jobCount ?? 0}
                      </span>
                    </td>
                    <td><Badge label={emp.isVerified ? 'verified' : 'unverified'} /></td>
                    <td><Badge label={emp.user?.isActive ? 'active' : 'inactive'} /></td>
                    <td>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          className="text-xs text-violet-400 hover:text-violet-300"
                          onClick={() => setSelectedId(emp.id)}
                        >
                          View
                        </button>
                        {emp.isVerified ? (
                          <button
                            className="text-xs text-amber-400 hover:text-amber-300"
                            onClick={() => setConfirm({ type: 'verify', id: emp.id, isVerified: false, name: emp.companyName })}
                          >
                            Unverify
                          </button>
                        ) : (
                          <button
                            className="text-xs text-emerald-400 hover:text-emerald-300"
                            onClick={() => setConfirm({ type: 'verify', id: emp.id, isVerified: true, name: emp.companyName })}
                          >
                            Verify
                          </button>
                        )}
                        {emp.user?.isActive ? (
                          <button
                            className="text-xs text-red-400 hover:text-red-300"
                            onClick={() => setConfirm({ type: 'status', userId: emp.user.id, isActive: false, name: emp.companyName })}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            className="text-xs text-emerald-400 hover:text-emerald-300"
                            onClick={() => setConfirm({ type: 'status', userId: emp.user.id, isActive: true, name: emp.companyName })}
                          >
                            Activate
                          </button>
                        )}
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
        <EmployerDetailPanel employerId={selectedId} onClose={() => setSelectedId(null)} />
      )}

      <ConfirmModal
        open={!!confirm}
        title={
          confirm?.type === 'verify'
            ? confirm?.isVerified ? 'Verify Employer' : 'Remove Verification'
            : confirm?.isActive ? 'Activate Account' : 'Deactivate Account'
        }
        message={
          confirm?.type === 'verify'
            ? confirm?.isVerified
              ? `Mark ${confirm?.name} as a verified employer?`
              : `Remove verified badge from ${confirm?.name}?`
            : confirm?.isActive
              ? `Reactivate the account for ${confirm?.name}?`
              : `Deactivate the account for ${confirm?.name}? All sessions will be revoked.`
        }
        confirmLabel={confirm?.type === 'verify' ? (confirm?.isVerified ? 'Verify' : 'Unverify') : (confirm?.isActive ? 'Activate' : 'Deactivate')}
        confirmClass={!confirm?.isVerified || !confirm?.isActive ? 'admin-btn-danger' : 'admin-btn-primary'}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
