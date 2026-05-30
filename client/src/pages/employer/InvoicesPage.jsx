import { Link } from 'react-router-dom';
import { useBilling } from '../../hooks/useBilling.js';

const STATUS_STYLES = {
  paid:    'bg-green-100 text-green-700',
  failed:  'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
  refunded:'bg-gray-100 text-gray-600',
};

function formatAmount(cents, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-800 mb-1">No invoices yet</p>
      <p className="text-xs text-gray-400">Your billing history will appear here after your first payment.</p>
      <Link to="/employer/billing" className="inline-block mt-4 text-sm text-primary-600 hover:underline">
        ← Back to billing
      </Link>
    </div>
  );
}

export default function InvoicesPage() {
  const { billingHistory, isLoading } = useBilling();

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/employer/billing"
          className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing History</h1>
          <p className="text-sm text-gray-500">All past invoices and payments</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-50">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-24" />
                <div className="h-4 bg-gray-100 rounded w-20 ml-auto" />
                <div className="h-5 bg-gray-100 rounded-full w-14" />
                <div className="h-4 bg-gray-100 rounded w-20" />
                <div className="h-4 bg-gray-100 rounded w-6" />
              </div>
            ))}
          </div>
        ) : billingHistory.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-600">Description</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-600">Period</th>
                  <th className="text-right px-6 py-3.5 font-semibold text-gray-600">Amount</th>
                  <th className="text-center px-6 py-3.5 font-semibold text-gray-600">Status</th>
                  <th className="text-center px-6 py-3.5 font-semibold text-gray-600">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {billingHistory.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {formatDate(inv.createdAt)}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800 capitalize">
                      {inv.plan ? `${inv.plan.charAt(0).toUpperCase() + inv.plan.slice(1)} Plan` : 'Subscription'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-xs">
                      {inv.periodStart && inv.periodEnd
                        ? `${formatDate(inv.periodStart)} – ${formatDate(inv.periodEnd)}`
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900 whitespace-nowrap">
                      {formatAmount(inv.amount, inv.currency)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[inv.status] || 'bg-gray-100 text-gray-500'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {inv.receiptUrl ? (
                        <a
                          href={inv.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-xs"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                          PDF
                        </a>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Note about PDF links */}
      {billingHistory.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          PDF receipts are available for invoices paid through Stripe.
        </p>
      )}
    </div>
  );
}
