import { useState } from 'react';
import { useUsers, useUpdateUserStatus, useUser } from '../../hooks/useAdmin';
import Badge from '../../components/common/Badge';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';
import UserDetailPanel from './UserDetailPanel';

export default function UsersPage() {
  const [filters, setFilters] = useState({ q: '', role: '', status: '', page: 1, limit: 20 });
  const [confirm, setConfirm] = useState(null); // { id, isActive, name }
  const [selectedId, setSelectedId] = useState(null);

  const { data, isLoading } = useUsers(filters);
  const updateStatus = useUpdateUserStatus();
  const { data: userDetail } = useUser(selectedId);

  const users = data?.users || [];
  const pagination = data?.pagination;

  const handleStatusToggle = (user) => {
    setConfirm({ id: user.id, isActive: !user.isActive, name: user.fullName });
  };

  const confirmAction = async () => {
    if (!confirm) return;
    await updateStatus.mutateAsync({ id: confirm.id, isActive: confirm.isActive });
    setConfirm(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Users</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {pagination?.total?.toLocaleString() ?? '…'} total users
          </p>
        </div>
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
          value={filters.role}
          onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value, page: 1 }))}
        >
          <option value="">All roles</option>
          <option value="seeker">Seeker</option>
          <option value="employer">Employer</option>
          <option value="admin">Admin</option>
        </select>
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
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Plan / Profile</th>
                <th>Joined</th>
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
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-500">No users found</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div>
                        <p className="font-medium text-slate-200">{user.fullName}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </td>
                    <td><Badge label={user.role} /></td>
                    <td><Badge label={user.isActive ? 'active' : 'inactive'} /></td>
                    <td>
                      <span className="text-xs text-slate-400">
                        {user.employerProfile?.subscriptionPlan || user.seekerProfile?.headline || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          className="text-xs text-violet-400 hover:text-violet-300"
                          onClick={() => setSelectedId(user.id)}
                        >
                          View
                        </button>
                        <button
                          className={`text-xs ${user.isActive ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'}`}
                          onClick={() => handleStatusToggle(user)}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
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

      {/* User detail panel */}
      {selectedId && (
        <UserDetailPanel
          data={userDetail}
          onClose={() => setSelectedId(null)}
          onStatusToggle={(user) => handleStatusToggle(user)}
        />
      )}

      {/* Confirm modal */}
      <ConfirmModal
        open={!!confirm}
        title={confirm?.isActive ? 'Activate User' : 'Deactivate User'}
        message={
          confirm?.isActive
            ? `Allow ${confirm?.name} to log in again?`
            : `This will revoke all active sessions for ${confirm?.name} and prevent them from logging in.`
        }
        confirmLabel={confirm?.isActive ? 'Activate' : 'Deactivate'}
        confirmClass={confirm?.isActive ? 'admin-btn-primary' : 'admin-btn-danger'}
        onConfirm={confirmAction}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
