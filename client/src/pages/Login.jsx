import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../hooks/useAuth.js';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';

const schema = yup.object({
  email: yup.string().email('Enter a valid email address.').required('Email is required.'),
  password: yup.string().required('Password is required.'),
  rememberMe: yup.boolean(),
});

const REMEMBERED_EMAIL_KEY = 'jp_remembered_email';

// Map raw API/network errors to human-readable messages
function friendlyError(err) {
  const msg = (err?.message ?? '').toLowerCase();

  if (msg.includes('invalid email or password') || msg.includes('invalid credentials')) {
    return { text: 'Incorrect email or password. Please try again.', type: 'credentials' };
  }
  if (msg.includes('deactivated')) {
    return { text: 'Your account has been deactivated. Please contact support.', type: 'account' };
  }
  if (msg.includes('too many') || msg.includes('rate limit')) {
    return { text: 'Too many login attempts. Please wait a few minutes and try again.', type: 'rate' };
  }
  if (msg.includes('network') || msg.includes('failed to fetch') || msg.includes('econnrefused')) {
    return { text: 'Unable to connect to the server. Check your internet connection.', type: 'network' };
  }
  if (msg.includes('timeout')) {
    return { text: 'The request timed out. Please try again.', type: 'timeout' };
  }
  // Fall back to whatever the server sent (already friendly in most cases)
  return { text: err?.message || 'Something went wrong. Please try again.', type: 'generic' };
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (saved) {
      setValue('email', saved);
      setValue('rememberMe', true);
    }
  }, [setValue]);

  const onSubmit = async ({ email, password, rememberMe }) => {
    try {
      await login(email, password);
      if (rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
      navigate(from, { replace: true });
    } catch (err) {
      const { text } = friendlyError(err);
      setError('root', { message: text });
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-xl mx-auto flex items-center justify-center mb-4">
            <span className="text-white font-bold text-lg">JP</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your Job Portal account</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="bg-white rounded-2xl border border-gray-200 shadow-card p-8 space-y-5"
        >
          {errors.root && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <span>{errors.root.message}</span>
            </div>
          )}

          <Input
            id="email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-primary-600 hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
              {...register('rememberMe')}
            />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>

          <Button type="submit" loading={isSubmitting} className="w-full">
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-primary-600 font-medium hover:underline">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
