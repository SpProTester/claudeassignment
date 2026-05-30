import { useState } from 'react';
import { useAdminUsers, useCreateAdminUser, useUpdateAdminStatus } from '../../hooks/useAdmin';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Badge from '../../components/common/Badge';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function AdminUsersPage() {
  const { admin: currentAdmin } = useAdminAuth();
  const { data: admins = [], isLoading } = useAdminUsers();
  const createAdmin = useCreateAdminUser();
  const updateStatus = useUpdateAdminStatus();

  const [form, setForm] = useState({ open: false, fullName: '', email: '', password: '' });
  const [formError, setFormError] = useState('');
  const [confirm, setConfirm] = useState(null);

  const openForm = () => setForm({ open: true, fullName: '', email: '', password: '' });
  const closeForm = () => { setForm({ open: false, fullName: '', email: '', password: '' }); setFormError(''); };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.fullName || !form.email || !form.password) {
      setFormError('All fields are required.');
      return;
    }
    if (form.password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }
    try {
      await createAdmin.mutateAsync({ fullName: form.fullName, email: form.email, password: form.password });
      closeForm();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to create admin user.');
    }
  };

  const runConfirm = async () => {
    if (!confirm) return;
    await updateStatus.mutateAsync({ id: confirm.id, isActive: confirm.isActive });
    setConfirm(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Admin Users</h2>
          <p className="text-sm text-slate-400 mt-0.5">Manage admin accounts and access</p>
        </div>
        <button onClick={openForm} className="admin-btn-primary">
          + New Admin
        </button>
      </div>

      {/* Create form */}
      {form.open && (
        <div className="admin-card">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Create Admin Account</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                <input
                  className="admin-input"
                  placeholder="Jane Doe"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  className="admin-input"
                  placeholder="admin@example.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  className="admin-input"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
              </div>
            </div>
            {formError && (
              <p className="text-xs text-red-400">{formError}</p>
            )}
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={createAdmin.isPending} className="admin-btn-primary text-sm">
                {createAdmin.isPending ? 'Creating…' : 'Create Admin'}
              </button>
              <button type="button" onClick={closeForm} className="admin-btn-secondary text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin users table */}
      <div className="admin-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 5 }).map((__, j) => (
                    <td key={j}><div className="h-4 bg-slate-800 animate-pulse rounded w-24" /></td>
                  ))}</tr>
                ))
              ) : admins.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-500">No admin users found</td></tr>
              ) : (
                admins.map((user) => {
                  const isSelf = user.id === currentAdmin?.id;
                  return (
                    <tr key={user.id}>
                      <td>
                        <p className="font-medium text-slate-200">{user.fullName}</p>
                        {isSelf && <span className="text-xs text-violet-400">(you)</span>}
                      </td>
                      <td>
                        <span className="text-sm text-slate-300">{user.email}</span>
                      </td>
                      <td><Badge label={user.isActive ? 'active' : 'inactive'} /></td>
                      <td>
                        <span className="text-xs text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td>
                        {isSelf ? (
                          <span className="text-xs text-slate-600">—</span>
                        ) : (
                          <button
                            className={`text-xs ${user.isActive ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'}`}
                            onClick={() => setConfirm({ id: user.id, isActive: !user.isActive, name: user.fullName })}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        open={!!confirm}
        title={confirm?.isActive ? 'Activate Admin' : 'Deactivate Admin'}
        message={
          confirm?.isActive
            ? `Allow ${confirm?.name} to access the admin portal again?`
            : `Deactivate ${confirm?.name}? They will be unable to log in.`
        }
        confirmLabel={confirm?.isActive ? 'Activate' : 'Deactivate'}
        confirmClass={confirm?.isActive ? 'admin-btn-primary' : 'admin-btn-danger'}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
