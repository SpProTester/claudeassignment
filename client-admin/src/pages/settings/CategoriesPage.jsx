import { useState } from 'react';
import { useCategories } from '../../hooks/useAdmin';
import { categoriesApi } from '../../api/adminApi';
import { useQueryClient } from '@tanstack/react-query';
import ConfirmModal from '../../components/common/ConfirmModal';

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const qc = useQueryClient();

  const [form, setForm] = useState({ name: '', slug: '' });
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (val) => {
    setForm((f) => ({ name: val, slug: editId ? f.slug : slugify(val) }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      setError('Name and slug are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editId) {
        await categoriesApi.update(editId, form);
      } else {
        await categoriesApi.create(form);
      }
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      setForm({ name: '', slug: '' });
      setEditId(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat) => {
    setEditId(cat.id);
    setForm({ name: cat.name, slug: cat.slug });
    setError('');
  };

  const handleDelete = async () => {
    await categoriesApi.remove(deleteTarget.id);
    qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Job Categories</h2>
        <p className="text-sm text-slate-400 mt-0.5">Manage the taxonomy used to classify job listings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="admin-card space-y-4">
          <h3 className="text-sm font-semibold text-slate-300">
            {editId ? 'Edit Category' : 'New Category'}
          </h3>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Name</label>
            <input
              className="admin-input"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Engineering"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Slug</label>
            <input
              className="admin-input font-mono text-xs"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="e.g. engineering"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-2">
            <button className="admin-btn-primary flex-1" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : editId ? 'Update' : 'Create'}
            </button>
            {editId && (
              <button
                className="admin-btn-secondary"
                onClick={() => { setEditId(null); setForm({ name: '', slug: '' }); setError(''); }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 admin-card p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-slate-300">{categories.length} Categories</h3>
          </div>
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 bg-slate-800 animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className={editId === cat.id ? 'bg-violet-900/10' : ''}>
                    <td className="font-medium text-slate-200">{cat.name}</td>
                    <td className="font-mono text-xs text-slate-400">{cat.slug}</td>
                    <td>
                      <div className="flex gap-3">
                        <button className="text-xs text-violet-400 hover:text-violet-300" onClick={() => handleEdit(cat)}>Edit</button>
                        <button className="text-xs text-red-400 hover:text-red-300" onClick={() => setDeleteTarget(cat)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Category"
        message={`Delete "${deleteTarget?.name}"? Jobs assigned to this category will lose their category tag.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
