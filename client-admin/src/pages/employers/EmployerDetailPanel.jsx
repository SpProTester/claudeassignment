import { useState } from 'react';
import { useEmployer, useVerifyEmployer, useAssignEmployerPlan, useUpdateUserStatus } from '../../hooks/useAdmin';
import Badge from '../../components/common/Badge';
import ConfirmModal from '../../components/common/ConfirmModal';

const PLANS = ['free', 'starter', 'professional', 'business'];
const fmt = (n) => n != null ? `$${(n / 100).toFixed(2)}` : '—';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

export default function EmployerDetailPanel({ employerId, onClose }) {
  const { data, isLoading } = useEmployer(employerId);
  const verifyMut = useVerifyEmployer();
  const planMut = useAssignEmployerPlan();
  const statusMut = useUpdateUserStatus();

  const [tab, setTab] = useState('overview');
  const [confirm, setConfirm] = useState(null);
  const [planForm, setPlanForm] = useState({ open: false, subscriptionPlan: '', subscriptionStatus: '' });

  if (!employerId) return null;

  const { employer, recentJobs = [], billingHistory = [] } = data || {};

  const handleVerify = (isVerified) => setConfirm({ type: 'verify', isVerified, label: isVerified ? 'Verify Employer' : 'Unverify Employer' });
  const handleUserStatus = (isActive) => setConfirm({ type: 'userStatus', isActive, label: isActive ? 'Activate Account' : 'Deactivate Account' });

  const runConfirm = async () => {
    if (!confirm) return;
    if (confirm.type === 'verify') {
      await verifyMut.mutateAsync({ id: employer.id, isVerified: confirm.isVerified });
    } else if (confirm.type === 'userStatus') {
      await statusMut.mutateAsync({ id: employer.user.id, isActive: confirm.isActive });
    }
    setConfirm(null);
  };

  const submitPlan = async () => {
    await planMut.mutateAsync({ id: employer.id, ...planForm });
    setPlanForm({ open: false, subscriptionPlan: '', subscriptionStatus: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      <aside className="w-[600px] bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
          <div>
            <h3 className="text-base font-semibold text-white">
              {isLoading ? '...' : employer?.companyName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{employer?.user?.email}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl leading-none">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-3 border-b border-slate-800 flex-shrink-0">
          {['overview', 'jobs', 'billing'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm capitalize rounded-t-lg transition-colors ${
                tab === t ? 'text-violet-300 border-b-2 border-violet-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !employer ? (
            <p className="text-slate-500 text-sm text-center py-10">Employer not found</p>
          ) : tab === 'overview' ? (
            <OverviewTab
              employer={employer}
              onVerify={handleVerify}
              onUserStatus={handleUserStatus}
              planForm={planForm}
              setPlanForm={setPlanForm}
              onSubmitPlan={submitPlan}
              planMut={planMut}
            />
          ) : tab === 'jobs' ? (
            <JobsTab jobs={recentJobs} />
          ) : (
            <BillingTab history={billingHistory} />
          )}
        </div>
      </aside>

      <ConfirmModal
        open={!!confirm}
        title={confirm?.label}
        message={
          confirm?.type === 'verify'
            ? confirm?.isVerified
              ? `Mark ${employer?.companyName} as a verified employer?`
              : `Remove verification badge from ${employer?.companyName}?`
            : confirm?.isActive
              ? `Reactivate ${employer?.user?.fullName}'s account?`
              : `Deactivate ${employer?.user?.fullName}'s account? All active sessions will be revoked.`
        }
        confirmLabel={confirm?.label}
        confirmClass={confirm?.isActive === false || confirm?.isVerified === false ? 'admin-btn-danger' : 'admin-btn-primary'}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

function OverviewTab({ employer, onVerify, onUserStatus, planForm, setPlanForm, onSubmitPlan, planMut }) {
  const stats = [
    { label: 'Total Jobs', value: employer.jobCount ?? 0 },
    { label: 'Active Jobs', value: employer.activeJobCount ?? 0 },
    { label: 'Applications', value: employer.totalApplications ?? 0 },
  ];

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-slate-800 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Company details */}
      <div className="admin-card space-y-3">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company Details</h4>
        <Row label="Industry" value={employer.industry || '—'} />
        <Row label="Size" value={employer.companySize || '—'} />
        <Row label="Website" value={employer.websiteUrl || '—'} />
        <Row label="Verified" value={<Badge label={employer.isVerified ? 'verified' : 'unverified'} />} />
        <Row label="Account" value={<Badge label={employer.user?.isActive ? 'active' : 'inactive'} />} />
        <Row label="Joined" value={new Date(employer.createdAt).toLocaleDateString()} />
      </div>

      {/* Subscription */}
      <div className="admin-card space-y-3">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subscription</h4>
        <Row label="Plan" value={<Badge label={employer.subscriptionPlan} />} />
        <Row label="Status" value={<Badge label={employer.subscriptionStatus || 'none'} />} />
        <Row label="Renews" value={employer.subscriptionCurrentPeriodEnd ? new Date(employer.subscriptionCurrentPeriodEnd).toLocaleDateString() : '—'} />
        <Row label="Stripe Sub ID" value={<span className="font-mono text-xs">{employer.stripeSubscriptionId || '—'}</span>} />

        {!planForm.open ? (
          <button onClick={() => setPlanForm({ open: true, subscriptionPlan: employer.subscriptionPlan || '', subscriptionStatus: employer.subscriptionStatus || '' })} className="admin-btn-secondary text-xs mt-2">
            Change Plan
          </button>
        ) : (
          <div className="space-y-2 pt-2 border-t border-slate-700">
            <select
              className="admin-input"
              value={planForm.subscriptionPlan}
              onChange={(e) => setPlanForm((f) => ({ ...f, subscriptionPlan: e.target.value }))}
            >
              <option value="">— select plan —</option>
              {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select
              className="admin-input"
              value={planForm.subscriptionStatus}
              onChange={(e) => setPlanForm((f) => ({ ...f, subscriptionStatus: e.target.value }))}
            >
              <option value="">— select status —</option>
              {['active', 'canceled', 'past_due', 'trialing'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={onSubmitPlan} disabled={planMut.isPending} className="admin-btn-primary text-xs">
                {planMut.isPending ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => setPlanForm({ open: false, subscriptionPlan: '', subscriptionStatus: '' })} className="admin-btn-secondary text-xs">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="admin-card space-y-2">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</h4>
        <div className="flex flex-wrap gap-2 pt-1">
          {employer.isVerified ? (
            <button onClick={() => onVerify(false)} className="admin-btn-secondary text-xs">Remove Verification</button>
          ) : (
            <button onClick={() => onVerify(true)} className="admin-btn-primary text-xs">Verify Employer</button>
          )}
          {employer.user?.isActive ? (
            <button onClick={() => onUserStatus(false)} className="admin-btn-danger text-xs">Deactivate Account</button>
          ) : (
            <button onClick={() => onUserStatus(true)} className="admin-btn-primary text-xs">Activate Account</button>
          )}
        </div>
      </div>
    </div>
  );
}

function JobsTab({ jobs }) {
  if (!jobs.length) return <p className="text-slate-500 text-sm text-center py-10">No jobs posted yet</p>;
  return (
    <div className="space-y-2">
      {jobs.map((job) => (
        <div key={job.id} className="bg-slate-800 rounded-lg px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-200">{job.title}</p>
            <p className="text-xs text-slate-500">{job.jobType} · {new Date(job.createdAt).toLocaleDateString()}</p>
          </div>
          <Badge label={job.status} />
        </div>
      ))}
    </div>
  );
}

function BillingTab({ history }) {
  if (!history.length) return <p className="text-slate-500 text-sm text-center py-10">No billing history</p>;
  return (
    <div className="space-y-2">
      {history.map((evt) => (
        <div key={evt.id} className="bg-slate-800 rounded-lg px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-200">{evt.plan || 'Payment'}</p>
            <p className="text-xs text-slate-500">{new Date(evt.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-white">{fmt(evt.amount)}</p>
            <Badge label={evt.status} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-200">{value}</span>
    </div>
  );
}
