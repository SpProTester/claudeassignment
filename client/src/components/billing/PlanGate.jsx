import { useState } from 'react';
import { useBilling, PLAN_TIER } from '../../hooks/useBilling.js';
import UpgradeModal from './UpgradeModal.jsx';

/**
 * PlanGate — wraps content that requires a minimum plan.
 * Shows a locked overlay + UpgradeModal if the employer's tier is insufficient.
 *
 * Usage:
 *   <PlanGate requiredPlan="professional" feature="Full ATS Board">
 *     <ATSBoard />
 *   </PlanGate>
 */
export default function PlanGate({ requiredPlan = 'professional', feature = 'this feature', children }) {
  const [showModal, setShowModal] = useState(false);
  const { planId, tier, isLoading } = useBilling();

  if (isLoading) {
    return (
      <div className="w-full rounded-xl bg-gray-50 border border-gray-100 h-40 animate-pulse" />
    );
  }

  const requiredTier = PLAN_TIER[requiredPlan] ?? 1;
  const hasAccess = tier >= requiredTier;

  if (hasAccess) return <>{children}</>;

  // Map plan names for display
  const planLabel = requiredPlan === 'business' ? 'Business' : 'Professional';

  return (
    <>
      <div className="relative rounded-xl overflow-hidden">
        {/* Blurred content preview */}
        <div className="select-none pointer-events-none" aria-hidden="true">
          <div className="blur-[3px] opacity-40">{children}</div>
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[1px]">
          <div className="flex flex-col items-center text-center px-6 py-8 max-w-xs">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {planLabel} plan required
            </p>
            <p className="text-xs text-gray-500 mb-5">
              Upgrade to unlock <span className="font-medium">{feature}</span> and more.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors shadow"
            >
              Upgrade Plan
            </button>
            <p className="text-xs text-gray-400 mt-2">
              Currently on <span className="capitalize">{planId}</span> plan
            </p>
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        requiredPlan={requiredPlan}
        feature={feature}
      />
    </>
  );
}
