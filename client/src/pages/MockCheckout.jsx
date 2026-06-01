import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PLAN_INFO = {
  professional: {
    name: 'Professional Plan',
    price: '$99',
    amount: 99,
    features: [
      '20 active job postings',
      'Full ATS kanban board',
      'Applicant notes & ratings',
      'Job analytics dashboard',
      'Priority email support',
    ],
  },
  business: {
    name: 'Business Plan',
    price: '$299',
    amount: 299,
    features: [
      'Unlimited job postings',
      'Full ATS kanban board',
      'Advanced analytics & exports',
      'Resume parsing',
      'Dedicated account manager',
    ],
  },
};

function formatCardNumber(value) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  return digits;
}

export default function MockCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sessionId  = searchParams.get('session_id');
  const plan       = searchParams.get('plan') || 'professional';
  const employerId = searchParams.get('employer_id');
  const customer   = searchParams.get('customer') || '';

  const planInfo = PLAN_INFO[plan] || PLAN_INFO.professional;

  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry]         = useState('12 / 26');
  const [cvc, setCvc]               = useState('123');
  const [name, setName]             = useState('');
  const [loading, setLoading]       = useState(false);

  const handlePay = () => {
    setLoading(true);
    const params = new URLSearchParams({
      session_id:  sessionId,
      plan,
      employer_id: employerId,
      customer,
    });
    // The backend completes the subscription and redirects to /employer/billing?success=true
    window.location.href = `/api/payments/dev/mock-checkout-complete?${params}`;
  };

  const handleCancel = () => {
    navigate('/employer/billing?canceled=true');
  };

  if (!sessionId || !employerId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-2">Invalid checkout session</h1>
          <p className="text-sm text-gray-500 mb-4">This checkout link is invalid or has expired.</p>
          <a href="/employer/billing" className="text-primary-600 text-sm font-medium hover:underline">
            Return to billing
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden md:grid md:grid-cols-[1fr_1.1fr]">

        {/* ── Left: Order summary ───────────────────────────────────────────── */}
        <div className="bg-gray-900 text-white p-8 flex flex-col">
          {/* Brand */}
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
              <span className="text-white font-black text-sm">W</span>
            </div>
            <span className="font-bold text-white tracking-tight text-lg">WorkHunt</span>
          </div>

          {/* Plan info */}
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Subscribe to</p>
          <h2 className="text-2xl font-extrabold mb-1">{planInfo.name}</h2>
          <div className="flex items-baseline gap-1 mb-8">
            <span className="text-4xl font-black">{planInfo.price}</span>
            <span className="text-gray-400 text-sm">/ month</span>
          </div>

          {/* Features */}
          <ul className="space-y-2.5 flex-1">
            {planInfo.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                <svg className="w-4 h-4 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {f}
              </li>
            ))}
          </ul>

          {/* Price summary */}
          <div className="mt-8 pt-6 border-t border-gray-700 space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Subtotal</span>
              <span>{planInfo.price} / mo</span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span>Due today</span>
              <span>{planInfo.price}</span>
            </div>
          </div>
        </div>

        {/* ── Right: Payment form ───────────────────────────────────────────── */}
        <div className="p-8 flex flex-col">
          {/* Test mode notice */}
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-3 mb-7">
            <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-xs font-bold text-amber-800">Test Mode — no real charge</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Use card <strong className="font-semibold">4242 4242 4242 4242</strong>, any future expiry, any CVC.
              </p>
            </div>
          </div>

          <h3 className="text-base font-bold text-gray-900 mb-5">Enter payment details</h3>

          <div className="space-y-4 flex-1">
            {/* Card number */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Card number</label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2.5 pr-14 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {/* Card brand icons */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <div className="w-7 h-5 rounded bg-blue-700 flex items-center justify-center">
                    <span className="text-white text-[8px] font-black tracking-tight">VISA</span>
                  </div>
                  <div className="w-7 h-5 rounded overflow-hidden flex">
                    <div className="flex-1 bg-red-500 opacity-90" />
                    <div className="flex-1 bg-amber-400 opacity-90" />
                  </div>
                </div>
              </div>
            </div>

            {/* Expiry + CVC */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Expiry date</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM / YY"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">CVC</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Name on card</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-7 space-y-3">
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 active:bg-primary-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing payment…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Pay {planInfo.price}
                </>
              )}
            </button>

            <button
              onClick={handleCancel}
              disabled={loading}
              className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel and go back
            </button>
          </div>

          <p className="mt-5 text-xs text-center text-gray-300">
            Powered by{' '}
            <svg className="inline w-9 h-3 ml-0.5 -mt-0.5" viewBox="0 0 60 25" fill="#6772e5" xmlns="http://www.w3.org/2000/svg">
              <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a10 10 0 01-4.56 1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.58zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.28c0-1.85-1.07-2.58-2.11-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.44.94V6.27h3.94l.2 1.05c.55-.72 1.55-1.29 2.98-1.29 2.55 0 5.06 2.23 5.06 7.04 0 4.97-2.47 7.23-4.82 7.23zm-.88-10.61c-.85 0-1.46.45-1.73.99l.03 5.09c.24.49.84.95 1.7.95 1.32 0 2.21-1.43 2.21-3.53 0-2.1-.9-3.5-2.21-3.5zM28.24 5.07c-1.44 0-2.38.57-2.38 2.01 0 1.42 1.37 1.99 3.01 1.99 1.14 0 2.25-.18 3.35-.53v3.5c-1.06.39-2.29.6-3.41.6-3.61 0-7.18-1.97-7.18-5.64S25.41 1 29.02 1c3.32 0 6.15 1.69 6.15 5.18 0 .21-.02.42-.04.63H28.24V5.07zm-7.08 15.04h4.44V6.27h-4.44v13.84zM14.05 6.27L9.64 20.11H5.21L.8 6.27H5.3l2.65 10.27L10.6 6.27h3.45zM24.45 3.08c-1.44 0-2.38-1.01-2.38-2.23C22.07.65 23.01 0 24.45 0s2.38.64 2.38 2.85c0 1.22-.94 2.23-2.38 2.23z"/>
            </svg>
            {' '}· Test environment only
          </p>
        </div>
      </div>
    </div>
  );
}
