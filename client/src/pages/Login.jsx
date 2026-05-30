import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../hooks/useAuth.js';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';

const schema = yup.object({
  email:      yup.string().email('Enter a valid email address.').required('Email is required.'),
  password:   yup.string().required('Password is required.'),
  rememberMe: yup.boolean(),
});

const REMEMBERED_EMAIL_KEY = 'jp_remembered_email';

function friendlyError(err) {
  const msg = (err?.message ?? '').toLowerCase();
  if (msg.includes('invalid email or password') || msg.includes('invalid credentials'))
    return { text: 'Incorrect email or password. Please try again.' };
  if (msg.includes('deactivated'))
    return { text: 'Your account has been deactivated. Please contact support.' };
  if (msg.includes('network') || msg.includes('failed to fetch') || msg.includes('econnrefused'))
    return { text: 'Unable to connect. Check your internet connection.' };
  return { text: err?.message || 'Something went wrong. Please try again.' };
}

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/dashboard';

  const { register, handleSubmit, setValue, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (saved) { setValue('email', saved); setValue('rememberMe', true); }
  }, [setValue]);

  const onSubmit = async ({ email, password, rememberMe }) => {
    try {
      await login(email, password);
      rememberMe
        ? localStorage.setItem(REMEMBERED_EMAIL_KEY, email)
        : localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      navigate(from, { replace: true });
    } catch (err) {
      setError('root', { message: friendlyError(err).text });
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left panel — purple brand */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 p-12 text-white">
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
            Your next big career move starts here.
          </h2>
          <p className="text-primary-200 text-base leading-relaxed">
            Thousands of companies are hiring right now. Sign in and find the role that was made for you.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { icon: '🔍', text: '12,400+ active job listings' },
            { icon: '🏢', text: '3,200+ verified companies' },
            { icon: '⚡', text: 'One-click apply to top roles' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-primary-100">
              <span className="text-lg">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                </svg>
              </div>
              <span className="text-xl font-extrabold text-gray-900"><span className="text-primary-600">Work</span>Hunt</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to continue to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 space-y-5">
            {errors.root && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374L10.051 3.878c.866-1.5 3.032-1.5 3.898 0l7.354 12.748zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span>{errors.root.message}</span>
              </div>
            )}

            <Input
              id="email" type="email" label="Email address"
              placeholder="you@example.com" autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-semibold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password" type="password"
                placeholder="••••••••" autoComplete="current-password"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div className="relative">
                <input type="checkbox" className="sr-only peer" {...register('rememberMe')} />
                <div className="w-4 h-4 rounded border-2 border-gray-300 peer-checked:bg-primary-600 peer-checked:border-primary-600 flex items-center justify-center transition-colors">
                  <svg className="w-2.5 h-2.5 text-white hidden peer-checked:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <span className="text-sm text-gray-600">Remember me for 30 days</span>
            </label>

            <Button type="submit" loading={isSubmitting} className="w-full py-3 text-base">
              Sign In
            </Button>

            <div className="relative text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <span className="relative bg-white px-3 text-xs text-gray-400 font-medium">OR</span>
            </div>

            <Link
              to="/register"
              className="flex items-center justify-center w-full py-3 border-2 border-gray-200 text-gray-700 font-semibold text-sm rounded-xl hover:border-primary-300 hover:text-primary-700 transition-colors"
            >
              Create a free account
            </Link>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
