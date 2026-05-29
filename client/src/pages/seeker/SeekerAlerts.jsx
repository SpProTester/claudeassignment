import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seekerService } from '../../services/seeker.service.js';
import { timeAgo } from '../../utils/helpers.js';

// ── Constants ─────────────────────────────────────────────────────────────────

const JOB_TYPES      = ['full-time', 'part-time', 'contract', 'freelance', 'internship'];
const WORK_MODES     = ['onsite', 'remote', 'hybrid'];
const EXP_LEVELS     = ['entry', 'mid', 'senior', 'lead', 'executive'];
const FREQUENCIES    = ['daily', 'weekly'];

const EMPTY_FORM = {
  keywords: '', location: '', jobType: '', workMode: '',
  experienceLevel: '', salaryMin: '', frequency: 'daily',
};

// ── Small helpers ─────────────────────────────────────────────────────────────

const FilterPill = ({ label }) => (
  <span className="inline-flex items-center bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
    {label}
  </span>
);

const alertSummary = (alert) => {
  const parts = [];
  if (alert.keywords)        parts.push(alert.keywords);
  if (alert.location)        parts.push(alert.location);
  if (alert.jobType)         parts.push(alert.jobType);
  if (alert.workMode)        parts.push(alert.workMode);
  if (alert.experienceLevel) parts.push(alert.experienceLevel);
  if (alert.salaryMin)       parts.push(`≥ ₹${Number(alert.salaryMin).toLocaleString()}`);
  return parts.length ? parts : ['All jobs'];
};

// ── Create alert form ─────────────────────────────────────────────────────────

function AlertForm({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const { mutate, isPending } = useMutation({
    mutationFn: seekerService.createAlert,
    onSuccess: () => { onCreated(); onClose(); },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.keywords && !form.location && !form.jobType && !form.workMode && !form.experienceLevel) {
      setError('Add at least one filter so the alert is meaningful.');
      return;
    }
    mutate({
      keywords:        form.keywords        || undefined,
      location:        form.location        || undefined,
      jobType:         form.jobType         || undefined,
      workMode:        form.workMode        || undefined,
      experienceLevel: form.experienceLevel || undefined,
      salaryMin:       form.salaryMin       ? parseInt(form.salaryMin, 10) : undefined,
      frequency:       form.frequency,
    });
  };

  const labelCls = 'block text-xs font-medium text-gray-700 mb-1';
  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent';
  const selectCls = inputCls + ' bg-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Create Job Alert</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Keywords</label>
              <input
                type="text"
                placeholder="e.g. React developer"
                value={form.keywords}
                onChange={set('keywords')}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input
                type="text"
                placeholder="e.g. Mumbai"
                value={form.location}
                onChange={set('location')}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Job Type</label>
              <select value={form.jobType} onChange={set('jobType')} className={selectCls}>
                <option value="">Any</option>
                {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Work Mode</label>
              <select value={form.workMode} onChange={set('workMode')} className={selectCls}>
                <option value="">Any</option>
                {WORK_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Experience</label>
              <select value={form.experienceLevel} onChange={set('experienceLevel')} className={selectCls}>
                <option value="">Any</option>
                {EXP_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Min Salary (₹)</label>
              <input
                type="number"
                placeholder="e.g. 500000"
                value={form.salaryMin}
                onChange={set('salaryMin')}
                min={0}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Frequency</label>
              <select value={form.frequency} onChange={set('frequency')} className={selectCls}>
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f} style={{ textTransform: 'capitalize' }}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline text-sm">Cancel</button>
            <button type="submit" disabled={isPending} className="btn-primary text-sm disabled:opacity-60">
              {isPending ? 'Saving…' : 'Create Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Alert card ────────────────────────────────────────────────────────────────

function AlertCard({ alert, onToggle, onDelete }) {
  return (
    <div className={`bg-white rounded-xl border ${alert.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'} shadow-card p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Filter pills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {alertSummary(alert).map((label, i) => (
              <FilterPill key={i} label={label} />
            ))}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className={`inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-full ${
              alert.frequency === 'daily'
                ? 'bg-purple-50 text-purple-700'
                : 'bg-amber-50 text-amber-700'
            }`}>
              {alert.frequency === 'daily' ? '📅 Daily' : '📆 Weekly'}
            </span>
            <span>Created {timeAgo(alert.createdAt)}</span>
            {alert.lastSentAt && <span>Last sent {timeAgo(alert.lastSentAt)}</span>}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Toggle switch */}
          <button
            onClick={() => onToggle(alert.id)}
            title={alert.isActive ? 'Disable alert' : 'Enable alert'}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
              alert.isActive ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                alert.isActive ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(alert.id)}
            title="Delete alert"
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SeekerAlerts() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['seeker', 'alerts'],
    queryFn: () => seekerService.listAlerts().then((r) => r.data),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['seeker', 'alerts'] });

  const toggleMutation = useMutation({
    mutationFn: seekerService.toggleAlert,
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: seekerService.deleteAlert,
    onSuccess: invalidate,
  });

  const alerts = data?.alerts ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Alerts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Get notified when matching jobs are posted. Max 10 alerts.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={alerts.length >= 10}
          className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + New Alert
        </button>
      </div>

      {/* How it works banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
        <span className="text-xl">💡</span>
        <div>
          <p className="text-sm font-medium text-blue-900">How it works</p>
          <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
            Daily alerts send a digest every morning at 8 AM with jobs posted in the last 24 hours.
            Weekly alerts send every 7 days. You'll receive an email with matching job cards and a link to apply.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="flex gap-2 mb-3">
                <div className="h-5 bg-gray-100 rounded-full w-24" />
                <div className="h-5 bg-gray-100 rounded-full w-20" />
              </div>
              <div className="h-4 bg-gray-100 rounded w-40" />
            </div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <div className="text-5xl mb-4">🔔</div>
          <h3 className="text-base font-semibold text-gray-900">No alerts yet</h3>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Create your first alert and never miss a matching job.
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
            Create Your First Alert
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onToggle={(id) => toggleMutation.mutate(id)}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
          <p className="text-xs text-center text-gray-400 pt-2">
            {alerts.length}/10 alerts used
          </p>
        </div>
      )}

      {showForm && (
        <AlertForm
          onClose={() => setShowForm(false)}
          onCreated={invalidate}
        />
      )}
    </div>
  );
}
