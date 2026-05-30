import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery } from '@tanstack/react-query';
import * as yup from 'yup';
import { useAuth } from '../hooks/useAuth.js';
import { paymentsService } from '../services/payments.service.js';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';

const schema = yup.object({
  role:            yup.string().oneOf(['seeker', 'employer']).required(),
  fullName:        yup.string().trim().min(2, 'At least 2 characters.').max(200).required('Full name is required.'),
  email:           yup.string().email('Enter a valid email address.').required('Email is required.'),
  password:        yup.string().min(8, 'Min 8 characters.').matches(/[A-Z]/, 'Need 1 uppercase.').matches(/[0-9]/, 'Need 1 number.').required('Password is required.'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords do not match.').required('Please confirm your password.'),
});

const ROLES = [
  { value: 'seeker',   label: 'Job Seeker',  icon: '🔍', desc: "I'm looking for work" },
  { value: 'employer', label: 'Employer',    icon: '🏢', desc: "I'm hiring talent" },
];

function PlanPickerCard({ plan, selected, onSelect }) {
  const isPopular = plan.id === 'professional';
  const price = plan.price === 0 ? 'Free forever' : `$${plan.price / 100}/mo`;
  return (
    <button
      type="button"
      onClick={() => onSelect(plan.id)}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-150 focus:outline-none ${
        selected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white hover:border-primary-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-gray-900">{plan.name}</span>
          {isPopular && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">Popular</span>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-sm font-bold ${selected ? 'text-primary-700' : 'text-gray-800'}`}>{price}</span>
          {selected && (
            <svg className="w-5 h-5 text-primary-600 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
      <ul className="space-y-1">
        {(plan.features ?? []).slice(0, 3).map((f) => (
          <li key={f} className="flex items-start gap-1.5 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
    </button>
  );
}

function PlanSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => <div key={i} className="h-28 rounded-2xl border-2 border-gray-100 bg-gray-50 animate-pulse" />)}
    </div>
  );
}

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const { register, handleSubmit, control, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: 'seeker', fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const role       = useWatch({ control, name: 'role' });
  const isEmployer = role === 'employer';

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ['plans'],
    queryFn:  paymentsService.getPlans,
    staleTime: Infinity,
    enabled:  isEmployer,
  });
  const plans = plansData?.data?.plans ?? [];

  const onSubmit = async ({ confirmPassword: _, ...payload }) => {
    try {
      await registerUser(payload);
      if (payload.role === 'employer' && selectedPlan !== 'starter') {
        setCheckoutLoading(true);
        try {
          const res = await paymentsService.createCheckout(selectedPlan);
          window.location.href = res.data.url;
          return;
        } catch { /* fall through */ }
      }
      navigate('/dashboard');
    } catch (err) {
      if (err.fieldErrors?.length) {
        const FIELD_MAP = { fullName: 'fullName', email: 'email', password: 'password', role: 'role' };
        let hasFieldError = false;
        err.fieldErrors.forEach(({ field, message }) => {
          if (FIELD_MAP[field]) { setError(FIELD_MAP[field], { message }); hasFieldError = true; }
        });
        if (!hasFieldError) setError('root', { message: err.message });
      } else {
        setError('root', { message: err.message });
      }
    }
  };

  const isWorking = isSubmitting || checkoutLoading;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 p-12 text-white">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight">WorkHunt</span>
          </Link>
          <h2 className="text-3xl font-extrabold leading-tight mb-4">
            {isEmployer ? 'Find the talent that moves your business forward.' : 'Land your dream job today.'}
          </h2>
          <p className="text-primary-200 text-base leading-relaxed">
            {isEmployer
              ? 'Post jobs, manage applicants, and hire top talent — all in one place.'
              : 'Join thousands of professionals who found their perfect role on WorkHunt.'}
          </p>
        </div>
        <div className="space-y-4">
          {(isEmployer ? [
            { icon: '📋', text: 'Post unlimited job listings' },
            { icon: '👥', text: 'Smart candidate matching' },
            { icon: '📊', text: 'Applicant pipeline & analytics' },
          ] : [
            { icon: '🔍', text: '12,400+ active job listings' },
            { icon: '🚀', text: 'One-click apply to top roles' },
            { icon: '🔔', text: 'Personalised job alerts' },
          ]).map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-primary-100">
              <span className="text-lg">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className={`flex items-start justify-center px-4 sm:px-8 py-10 ${isEmployer ? '' : 'min-h-full'}`}>
          <div className={`w-full transition-all duration-300 ${isEmployer ? 'max-w-5xl' : 'max-w-md'}`}>

            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2">
                <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                  </svg>
                </div>
                <span className="text-xl font-extrabold text-gray-900"><span className="text-primary-600">Work</span>Hunt</span>
              </Link>
            </div>

            <div className={`flex gap-6 items-start ${isEmployer ? 'flex-col lg:flex-row' : 'flex-col'}`}>
              {/* Form */}
              <div className={isEmployer ? 'w-full lg:w-[400px] shrink-0' : 'w-full'}>
                <div className="mb-6">
                  <h1 className="text-2xl font-extrabold text-gray-900">Create your account</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    {isEmployer ? 'Start hiring in minutes' : 'Join thousands finding their next opportunity'}
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="bg-white rounded-2xl border border-gray-100 shadow-card p-7 space-y-5">
                  {errors.root && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                      {errors.root.message}
                    </div>
                  )}

                  {/* Role toggle */}
                  <Controller
                    name="role" control={control}
                    render={({ field }) => (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">I am a…</p>
                        <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                          {ROLES.map(({ value, label, icon, desc }) => (
                            <button
                              key={value} type="button"
                              onClick={() => { field.onChange(value); if (value === 'seeker') setSelectedPlan('starter'); }}
                              className={`flex flex-col items-center py-3 text-sm font-semibold rounded-xl transition-all duration-150 ${
                                field.value === value
                                  ? 'bg-white text-primary-700 shadow-sm ring-1 ring-gray-200'
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              <span className="text-lg mb-0.5">{icon}</span>
                              <span>{label}</span>
                              <span className="text-xs font-normal text-gray-400 hidden sm:block">{desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  />

                  <Input id="fullName" label="Full name" placeholder="Jane Smith" autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
                  <Input id="email" type="email" label="Email address" placeholder="you@example.com" autoComplete="email" error={errors.email?.message} {...register('email')} />
                  <Input id="password" type="password" label="Password" placeholder="Min 8 chars · uppercase · number" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
                  <Input id="confirmPassword" type="password" label="Confirm password" placeholder="Re-enter your password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />

                  {isEmployer && selectedPlan && selectedPlan !== 'starter' && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary-50 border border-primary-100 text-xs text-primary-700">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                      </svg>
                      <span>
                        You&apos;ll be taken to checkout for the <strong className="capitalize">{selectedPlan}</strong> plan after signup.
                      </span>
                    </div>
                  )}

                  <Button type="submit" loading={isWorking} className="w-full py-3 text-base">
                    {isEmployer && selectedPlan !== 'starter' ? 'Create Account & Choose Plan' : 'Create Account'}
                  </Button>

                  <p className="text-xs text-gray-400 text-center">
                    By creating an account, you agree to our{' '}
                    <Link to="/" className="text-primary-600 hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/" className="text-primary-600 hover:underline">Privacy Policy</Link>.
                  </p>
                </form>

                <p className="text-center text-sm text-gray-500 mt-5">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
                </p>
              </div>

              {/* Plan selector (employer only) */}
              {isEmployer && (
                <div className="flex-1 w-full">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                    <div className="mb-5">
                      <h2 className="text-base font-bold text-gray-900">Choose your plan</h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Change or cancel anytime.{' '}
                        <Link to="/pricing" target="_blank" className="text-primary-600 hover:underline">Full comparison →</Link>
                      </p>
                    </div>
                    {plansLoading ? <PlanSkeleton /> : (
                      <div className="space-y-3">
                        {plans.map((plan) => (
                          <PlanPickerCard key={plan.id} plan={plan} selected={selectedPlan === plan.id} onSelect={setSelectedPlan} />
                        ))}
                      </div>
                    )}
                    <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                      {[{ icon: '🔒', text: 'Secure payment' }, { icon: '↩️', text: 'Cancel anytime' }, { icon: '⚡', text: 'Instant access' }].map(({ icon, text }) => (
                        <div key={text} className="flex flex-col items-center gap-1">
                          <span className="text-base">{icon}</span>
                          <span className="text-xs text-gray-400">{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
