import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PricingCard from './PricingCard.jsx';
import { paymentsService } from '../../services/payments.service.js';
import { useBilling, PLAN_TIER } from '../../hooks/useBilling.js';

/**
 * UpgradeModal
 * Props:
 *   isOpen       — bool
 *   onClose      — () => void
 *   requiredPlan — 'professional' | 'business'  (minimum plan needed)
 *   feature      — string  e.g. "Full ATS Board"
 */
export default function UpgradeModal({ isOpen, onClose, requiredPlan = 'professional', feature = 'this feature' }) {
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const { planId: currentPlanId } = useBilling();

  const { data: plansData } = useQuery({
    queryKey: ['plans'],
    queryFn: paymentsService.getPlans,
    staleTime: Infinity,
  });

  const allPlans = plansData?.data?.plans ?? [];
  const requiredTier = PLAN_TIER[requiredPlan] ?? 1;
  // Only show plans that satisfy the requirement
  const eligiblePlans = allPlans.filter((p) => (PLAN_TIER[p.id] ?? 0) >= requiredTier);

  const handleSelect = async (planId) => {
    if (planId === 'starter') return;
    setLoadingPlan(planId);
    try {
      const res = await paymentsService.createCheckout(planId);
      window.location.href = res.data.url;
    } catch {
      setLoadingPlan(null);
      navigate('/employer/billing');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Unlock {feature}</h2>
              <p className="text-sm text-gray-500">
                Upgrade your plan to access this feature
              </p>
            </div>
          </div>
        </div>

        {/* Plan cards */}
        <div className="p-8">
          <div className={`grid gap-6 ${eligiblePlans.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {eligiblePlans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                currentPlanId={currentPlanId}
                onSelect={handleSelect}
                loading={loadingPlan === plan.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
