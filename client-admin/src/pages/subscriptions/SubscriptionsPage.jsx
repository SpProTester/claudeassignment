import { useState } from 'react';
import { useSubscriptions, usePayments } from '../../hooks/useAdmin';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';

const fmt = (n) => n != null ? `$${(n / 100).toFixed(2)}` : '—';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

const PLAN_OPTIONS = ['', 'free', 'starter', 'professional', 'business'];
const SUB_STATUS_OPTIONS = ['', 'active', 'canceled', 'past_due', 'trialing'];
const PAYMENT_STATUS_OPTIONS = ['', 'paid', 'failed', 'pending', 'refunded'];

export default function SubscriptionsPage() {
  const [tab, setTab] = useState('subscriptions');
  const [subFilters, setSubFilters] = useState({ subscriptionStatus: '', subscriptionPlan: '', page: 1, limit: 20 });
  const [payFilters, setPayFilters] = useState({ status: '', page: 1, limit: 20 });

  const { data: subData, isLoading: subLoading } = useSubscriptions(subFilters);
  const { data: payData, isLoading: payLoading } = usePayments(payFilters);

  const subscriptions = subData?.subscriptions || [];
  const payments = payData?.payments || [];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">Subscriptions</h2>
        <p className="text-sm text-slate-400 mt-0.5">Monitor employer subscription plans and payment history</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 w-fit">
        {['subscriptions', 'payment history'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm capitalize transition-colors ${
              tab === t ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'subscriptions' ? (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              className="admin-input w-44"
              value={subFilters.subscriptionPlan}
              onChange={(e) => setSubFilters((f) => ({ ...f, subscriptionPlan: e.target.value, page: 1 }))}
            >
              <option value="">All plans</option>
              {PLAN_OPTIONS.slice(1).map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select
              className="admin-input w-44"
              value={subFilters.subscriptionStatus}
              onChange={(e) => setSubFilters((f) => ({ ...f, subscriptionStatus: e.target.value, page: 1 }))}
            >
              <option value="">All statuses</option>
              {SUB_STATUS_OPTIONS.slice(1).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Subscriptions table */}
          <div className="admin-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Contact</th>
                    <th>Plan</th>
                    <th>Sub Status</th>
                    <th>Account</th>
                    <th>Period End</th>
                    <th>Stripe Sub</th>
                  </tr>
                </thead>
                <tbody>
                  {subLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}>{Array.from({ length: 7 }).map((__, j) => (
                        <td key={j}><div className="h-4 bg-slate-800 animate-pulse rounded w-20" /></td>
                      ))}</tr>
                    ))
                  ) : subscriptions.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-slate-500">No subscriptions found</td></tr>
                  ) : (
                    subscriptions.map((sub) => (
                      <tr key={sub.id}>
                        <td>
                          <p className="font-medium text-slate-200">{sub.companyName}</p>
                        </td>
                        <td>
                          <p className="text-sm text-slate-300">{sub.user?.fullName}</p>
                          <p className="text-xs text-slate-500">{sub.user?.email}</p>
                        </td>
                        <td><Badge label={sub.subscriptionPlan} /></td>
                        <td><Badge label={sub.subscriptionStatus || 'none'} /></td>
                        <td><Badge label={sub.user?.isActive ? 'active' : 'inactive'} /></td>
                        <td>
                          <span className={`text-xs ${
                            sub.subscriptionCurrentPeriodEnd && new Date(sub.subscriptionCurrentPeriodEnd) < new Date()
                              ? 'text-red-400' : 'text-slate-400'
                          }`}>
                            {fmtDate(sub.subscriptionCurrentPeriodEnd)}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono text-xs text-slate-500 truncate max-w-[120px] block">
                            {sub.stripeSubscriptionId || '—'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {subData?.pagination && (
              <div className="p-4 border-t border-slate-800">
                <Pagination
                  page={subFilters.page}
                  totalPages={subData.pagination.totalPages}
                  onPage={(p) => setSubFilters((f) => ({ ...f, page: p }))}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Payment filters */}
          <div className="flex flex-wrap gap-3">
            <select
              className="admin-input w-44"
              value={payFilters.status}
              onChange={(e) => setPayFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
            >
              <option value="">All statuses</option>
              {PAYMENT_STATUS_OPTIONS.slice(1).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Payments table */}
          <div className="admin-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Contact</th>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Period</th>
                    <th>Date</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {payLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}>{Array.from({ length: 8 }).map((__, j) => (
                        <td key={j}><div className="h-4 bg-slate-800 animate-pulse rounded w-20" /></td>
                      ))}</tr>
                    ))
                  ) : payments.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-10 text-slate-500">No payment history found</td></tr>
                  ) : (
                    payments.map((pay) => (
                      <tr key={pay.id}>
                        <td>
                          <p className="font-medium text-slate-200">{pay.employer?.companyName}</p>
                        </td>
                        <td>
                          <p className="text-sm text-slate-300">{pay.employer?.user?.fullName}</p>
                          <p className="text-xs text-slate-500">{pay.employer?.user?.email}</p>
                        </td>
                        <td>
                          <span className="text-xs text-slate-300">{pay.plan || pay.employer?.subscriptionPlan || '—'}</span>
                        </td>
                        <td>
                          <span className={`text-sm font-semibold ${pay.status === 'paid' ? 'text-emerald-400' : pay.status === 'failed' ? 'text-red-400' : 'text-slate-300'}`}>
                            {fmt(pay.amount)}
                          </span>
                        </td>
                        <td><Badge label={pay.status} /></td>
                        <td>
                          <span className="text-xs text-slate-400">
                            {pay.periodStart ? `${fmtDate(pay.periodStart)} – ${fmtDate(pay.periodEnd)}` : '—'}
                          </span>
                        </td>
                        <td>
                          <span className="text-xs text-slate-400">{fmtDate(pay.createdAt)}</span>
                        </td>
                        <td>
                          {pay.receiptUrl ? (
                            <a href={pay.receiptUrl} target="_blank" rel="noreferrer" className="text-xs text-violet-400 hover:text-violet-300">
                              View
                            </a>
                          ) : <span className="text-xs text-slate-600">—</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {payData?.pagination && (
              <div className="p-4 border-t border-slate-800">
                <Pagination
                  page={payFilters.page}
                  totalPages={payData.pagination.totalPages}
                  onPage={(p) => setPayFilters((f) => ({ ...f, page: p }))}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
