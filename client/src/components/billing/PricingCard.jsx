import { PLAN_TIER } from '../../hooks/useBilling.js';

const CheckIcon = () => (
  <svg className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const formatPrice = (cents) =>
  cents === 0 ? 'Free' : `$${(cents / 100).toFixed(0)}/mo`;

/**
 * PricingCard
 * Props:
 *   plan        — { id, name, price, currency, interval, features }
 *   currentPlanId — employer's active plan id (null if not logged in)
 *   onSelect    — (planId) => void  — called when CTA is clicked
 *   loading     — bool — show spinner on CTA
 *   isPublic    — bool — if true, CTA links to /register instead of checkout
 */
export default function PricingCard({ plan, currentPlanId, onSelect, loading = false, isPublic = false }) {
  const isCurrent = plan.id === currentPlanId;
  const currentTier = PLAN_TIER[currentPlanId] ?? -1;
  const planTier = PLAN_TIER[plan.id] ?? 0;
  const isHighlighted = plan.id === 'professional';
  const canUpgrade = !isCurrent && planTier > currentTier && currentPlanId !== null;
  const canDowngrade = !isCurrent && planTier < currentTier;

  const ctaLabel = () => {
    if (isPublic && plan.id === 'starter') return 'Get Started Free';
    if (isPublic) return 'Get Started';
    if (isCurrent) return 'Current Plan';
    if (plan.id === 'starter' && canDowngrade) return 'Downgrade to Free';
    if (canUpgrade) return `Upgrade to ${plan.name}`;
    if (canDowngrade) return `Downgrade to ${plan.name}`;
    return 'Get Started';
  };

  const ctaDisabled = isCurrent || loading;

  return (
    <div
      className={`relative flex flex-col rounded-2xl p-8 transition-shadow ${
        isHighlighted
          ? 'bg-primary-600 text-white shadow-2xl shadow-primary-200 ring-2 ring-primary-600'
          : 'bg-white border border-gray-200 shadow-sm hover:shadow-md'
      }`}
    >
      {isHighlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400 text-amber-900">
          Most Popular
        </span>
      )}

      {/* Plan header */}
      <div className="mb-6">
        <p className={`text-sm font-semibold uppercase tracking-widest mb-1 ${isHighlighted ? 'text-primary-200' : 'text-primary-600'}`}>
          {plan.name}
        </p>
        <div className="flex items-end gap-1">
          <span className={`text-4xl font-bold ${isHighlighted ? 'text-white' : 'text-gray-900'}`}>
            {formatPrice(plan.price)}
          </span>
          {plan.interval && (
            <span className={`text-sm mb-1 ${isHighlighted ? 'text-primary-200' : 'text-gray-500'}`}>
              /{plan.interval}
            </span>
          )}
        </div>
        {plan.price === 0 && (
          <p className={`text-xs mt-1 ${isHighlighted ? 'text-primary-200' : 'text-gray-400'}`}>
            No credit card required
          </p>
        )}
      </div>

      {/* Feature list */}
      <ul className="flex-1 space-y-3 mb-8">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            {isHighlighted ? (
              <svg className="w-4 h-4 text-primary-200 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <CheckIcon />
            )}
            <span className={`text-sm ${isHighlighted ? 'text-primary-100' : 'text-gray-600'}`}>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={() => !ctaDisabled && onSelect?.(plan.id)}
        disabled={ctaDisabled}
        className={`w-full py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2
          ${isCurrent
            ? `cursor-default ${isHighlighted ? 'bg-primary-500 text-primary-100' : 'bg-gray-100 text-gray-400'}`
            : isHighlighted
              ? 'bg-white text-primary-600 hover:bg-primary-50 shadow'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
            </svg>
            Redirecting…
          </>
        ) : (
          ctaLabel()
        )}
      </button>
    </div>
  );
}
