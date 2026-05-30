import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PricingCard from '../components/billing/PricingCard.jsx';
import { paymentsService } from '../services/payments.service.js';
import { useBilling } from '../hooks/useBilling.js';
import { useAuth } from '../hooks/useAuth.js';

const FAQ = [
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel at any time from your billing dashboard. You retain access until the end of the current billing period.' },
  { q: 'Is there a free trial?', a: 'The Starter plan is free forever. Paid plans start immediately when you subscribe.' },
  { q: 'What counts as an "active job posting"?', a: 'Any job with status Draft, Active, or Paused counts against your limit. Closed or expired jobs do not.' },
  { q: 'Can I upgrade or downgrade later?', a: 'Yes. Changes take effect immediately for upgrades. Downgrades take effect at the end of the billing period.' },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEmployer = user?.role === 'employer';
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const { data: plansData, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: paymentsService.getPlans,
    staleTime: Infinity,
  });

  const { planId: currentPlanId } = useBilling({ enabled: isEmployer });

  const plans = plansData?.data?.plans ?? [];

  const handleSelect = async (planId) => {
    if (planId === 'starter') {
      navigate('/register');
      return;
    }
    if (!user) {
      navigate('/register');
      return;
    }
    if (!isEmployer) {
      navigate('/register');
      return;
    }
    setLoadingPlan(planId);
    try {
      const res = await paymentsService.createCheckout(planId);
      window.location.href = res.data.url;
    } catch {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="bg-white border-b border-gray-100 pt-16 pb-20 text-center px-4">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 mb-4">
          Simple, transparent pricing
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Plans for every stage
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Start free, upgrade when you need more reach. No hidden fees, no long-term contracts.
        </p>
      </section>

      {/* Plans grid */}
      <section className="max-w-5xl mx-auto px-4 -mt-8 pb-20">
        {isLoading ? (
          <div className="grid sm:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-white border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                currentPlanId={isEmployer ? currentPlanId : null}
                onSelect={handleSelect}
                loading={loadingPlan === plan.id}
                isPublic={!isEmployer}
              />
            ))}
          </div>
        )}
      </section>

      {/* Feature comparison table */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Full feature comparison</h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 font-semibold text-gray-700 w-1/2">Feature</th>
                <th className="text-center px-4 py-4 font-semibold text-gray-700">Starter</th>
                <th className="text-center px-4 py-4 font-semibold text-primary-600 bg-primary-50">Professional</th>
                <th className="text-center px-4 py-4 font-semibold text-gray-700">Business</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Active job postings', starter: '5', pro: '20', biz: 'Unlimited' },
                { label: 'Applicant tracking (ATS)', starter: 'Basic', pro: 'Full kanban', biz: 'Full kanban' },
                { label: 'Applicant notes & ratings', starter: false, pro: true, biz: true },
                { label: 'Job analytics dashboard', starter: false, pro: true, biz: true },
                { label: 'Advanced analytics & exports', starter: false, pro: false, biz: true },
                { label: 'Resume parsing', starter: false, pro: false, biz: true },
                { label: 'Dedicated account manager', starter: false, pro: false, biz: true },
                { label: 'Custom employer branding', starter: false, pro: false, biz: true },
                { label: 'Support', starter: 'Email', pro: 'Priority', biz: 'Dedicated' },
              ].map((row, i) => (
                <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                  <td className="px-6 py-4 text-gray-700 font-medium">{row.label}</td>
                  <td className="text-center px-4 py-4 text-gray-500">{renderCell(row.starter)}</td>
                  <td className="text-center px-4 py-4 bg-primary-50/30">{renderCell(row.pro)}</td>
                  <td className="text-center px-4 py-4 text-gray-700">{renderCell(row.biz)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently asked questions</h2>
        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {item.q}
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm text-gray-500 border-t border-gray-100 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-primary-600 py-16 text-center px-4">
        <h2 className="text-2xl font-bold text-white mb-3">Ready to hire faster?</h2>
        <p className="text-primary-200 mb-8">Join thousands of employers already using our platform.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-primary-700 font-semibold text-sm hover:bg-primary-50 transition-colors shadow"
          >
            Start for free
          </Link>
          {!user && (
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-primary-400 text-white font-semibold text-sm hover:bg-primary-700 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

function renderCell(val) {
  if (val === true) {
    return (
      <svg className="w-5 h-5 text-primary-600 inline" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    );
  }
  if (val === false) {
    return <span className="text-gray-300">—</span>;
  }
  return <span className="text-gray-600">{val}</span>;
}
