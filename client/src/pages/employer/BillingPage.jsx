import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBilling, PLAN_LIMITS, PLAN_DISPLAY } from '../../hooks/useBilling.js';
import { paymentsService } from '../../services/payments.service.js';
import { employerService } from '../../services/employer.service.js';
import UpgradeModal from '../../components/billing/UpgradeModal.jsx';

// ── Status chip ───────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  active:    'bg-green-100 text-green-700',
  trialing:  'bg-blue-100 text-blue-700',
  at_risk:   'bg-amber-100 text-amber-700',
  canceled:  'bg-gray-100 text-gray-500',
  past_due:  'bg-red-100 text-red-700',
};
const STATUS_LABELS = {
  active: 'Active', trialing: 'Trialing', at_risk: 'Payment at risk',
  canceled: 'Canceled', past_due: 'Past due',
};

function StatusChip({ status }) {
  if (!status) return null;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-500'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// ── Usage bar ─────────────────────────────────────────────────────────────────
function UsageBar({ used, limit }) {
  const pct = limit === Infinity ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-primary-500';
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-gray-500">Active job postings</span>
        <span className="text-xs font-semibold text-gray-700">
          {used} / {limit === Infinity ? '∞' : limit}
        </span>
      </div>
      {limit !== Infinity && (
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
      )}
      {limit === Infinity && (
        <p className="text-xs text-primary-600 font-medium">Unlimited postings</p>
      )}
    </div>
  );
}

// ── Cancel confirmation modal ─────────────────────────────────────────────────
function CancelModal({ isOpen, onClose, onConfirm, periodEnd, loading }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Cancel subscription?</h3>
            <p className="text-sm text-gray-500">This action cannot be undone immediately.</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          Your subscription will remain active until{' '}
          <strong>{periodEnd ? new Date(periodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'end of billing period'}</strong>,
          then your account will be downgraded to the Starter plan.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Keep subscription
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : null}
            Yes, cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BillingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [banner, setBanner] = useState(null); // { type: 'success'|'error'|'warn', message }

  // Handle Stripe return params
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setBanner({ type: 'success', message: 'Your subscription has been activated successfully!' });
      setSearchParams({}, { replace: true });
      queryClient.invalidateQueries({ queryKey: ['billing'] });
    } else if (searchParams.get('canceled') === 'true') {
      setBanner({ type: 'warn', message: 'Checkout canceled. No changes were made.' });
      setSearchParams({}, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { currentPlan, planId, jobLimit, isLoading, isError, refetch } = useBilling();

  // Fetch active job count for usage bar
  const { data: jobsData } = useQuery({
    queryKey: ['employer', 'jobs'],
    queryFn: () => employerService.listJobs({ limit: 100 }),
  });
  const activeJobs = (jobsData?.data?.jobs ?? []).filter(
    (j) => ['draft', 'active', 'paused'].includes(j.status)
  ).length;

  const cancelMutation = useMutation({
    mutationFn: paymentsService.cancel,
    onSuccess: () => {
      setShowCancelModal(false);
      setBanner({ type: 'success', message: 'Subscription will be canceled at the end of the billing period.' });
      refetch();
    },
  });

  const handleUpgrade = async (plan) => {
    setCheckoutLoading(plan);
    try {
      const res = await paymentsService.createCheckout(plan);
      window.location.href = res.data.url;
    } catch (err) {
      setBanner({ type: 'error', message: err.message || 'Failed to start checkout.' });
      setCheckoutLoading(null);
    }
  };

  const planDisplay = PLAN_DISPLAY[planId] || 'Starter';
  const limit = PLAN_LIMITS[planId] ?? 5;
  const isPaid = planId === 'professional' || planId === 'business' || planId === 'basic' || planId === 'premium';

  return (
    <div className="max-w-3xl space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Billing & Subscription</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your plan, usage, and payment history.</p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <svg className="w-4 h-4 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading billing info…
          </div>
        )}
      </div>

      {/* API error notice */}
      {isError && !isLoading && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-xl">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>Could not load billing details. Showing your current plan defaults.</span>
          <button onClick={() => refetch()} className="ml-auto text-amber-700 font-semibold hover:underline">Retry</button>
        </div>
      )}

      {/* Result banners */}
      {banner && (
        <div className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
          banner.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          banner.type === 'warn'    ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                                     'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            {banner.type === 'success'
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            }
          </svg>
          <div className="flex-1">{banner.message}</div>
          <button onClick={() => setBanner(null)} className="text-current opacity-60 hover:opacity-100">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Current plan card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h2 className="text-base font-bold text-gray-900">{planDisplay} Plan</h2>
                <StatusChip status={currentPlan?.status} />
                {currentPlan?.cancelAtPeriodEnd && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                    Canceling
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {isPaid
                  ? `$${(currentPlan?.price / 100).toFixed(0)}/month`
                  : 'Free forever'}
                {currentPlan?.currentPeriodEnd && (
                  <> · Renews {new Date(currentPlan.currentPeriodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                )}
              </p>
            </div>

            {/* Upgrade button */}
            {planId !== 'business' && planId !== 'premium' && !currentPlan?.cancelAtPeriodEnd && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
              >
                Upgrade Plan
              </button>
            )}
          </div>
        </div>

        {/* Usage */}
        <div className="px-6 py-5 border-b border-gray-100">
          <UsageBar used={activeJobs} limit={limit} />
          {activeJobs >= limit && limit !== Infinity && (
            <p className="text-xs text-red-600 mt-2 font-medium">
              Limit reached. <button onClick={() => setShowUpgradeModal(true)} className="underline">Upgrade</button> to post more jobs.
            </p>
          )}
        </div>

        {/* Cancel at period end warning */}
        {currentPlan?.cancelAtPeriodEnd && (
          <div className="px-6 py-4 bg-amber-50 border-b border-amber-100">
            <p className="text-sm text-amber-800">
              <strong>Subscription ending.</strong> Your plan will downgrade to Starter on{' '}
              {new Date(currentPlan.currentPeriodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.
            </p>
          </div>
        )}

        {/* Actions row */}
        <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <Link
            to="/employer/billing/invoices"
            className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75" />
            </svg>
            View billing history
          </Link>
          <Link
            to="/pricing"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5"
          >
            Compare plans
          </Link>
          {isPaid && !currentPlan?.cancelAtPeriodEnd && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              Cancel subscription
            </button>
          )}
        </div>
      </div>

      {/* Quick plan comparison */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Available plans</h2>
          <Link to="/pricing" className="text-xs text-primary-600 hover:underline">See full comparison</Link>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { id: 'starter', label: 'Starter', price: 'Free', jobs: '5 jobs' },
            { id: 'professional', label: 'Professional', price: '$99/mo', jobs: '20 jobs' },
            { id: 'business', label: 'Business', price: '$299/mo', jobs: 'Unlimited' },
          ].map((p) => {
            const isCurrent = ['starter', 'free'].includes(planId) ? p.id === 'starter'
              : ['professional', 'basic'].includes(planId) ? p.id === 'professional'
              : p.id === 'business';
            return (
              <div
                key={p.id}
                className={`rounded-xl border p-4 ${isCurrent ? 'border-primary-500 bg-primary-50' : 'border-gray-100'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">{p.label}</span>
                  {isCurrent && <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 font-medium">Current</span>}
                </div>
                <p className="text-lg font-bold text-gray-900">{p.price}</p>
                <p className="text-xs text-gray-500">{p.jobs}</p>
                {!isCurrent && p.id !== 'starter' && (
                  <button
                    onClick={() => handleUpgrade(p.id)}
                    disabled={!!checkoutLoading}
                    className="mt-3 w-full py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60"
                  >
                    {checkoutLoading === p.id ? 'Loading…' : 'Upgrade'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        requiredPlan="professional"
        feature="a premium plan"
      />
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => cancelMutation.mutate()}
        periodEnd={currentPlan?.currentPeriodEnd}
        loading={cancelMutation.isPending}
      />
    </div>
  );
}
