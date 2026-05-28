import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authService } from '../services/auth.service.js';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';

const schema = yup.object({
  email: yup.string().email('Enter a valid email address.').required('Email is required.'),
});

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [sentTo, setSentTo] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async ({ email }) => {
    try {
      await authService.forgotPassword(email);
      setSentTo(email);
    } catch (err) {
      setError('root', { message: err.message });
    }
  };

  // ── Success state ─────────────────────────────────────────────────────────
  if (sentTo) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm mb-1">
            We sent a 6-digit OTP to
          </p>
          <p className="text-gray-800 font-medium mb-6">{sentTo}</p>
          <p className="text-gray-500 text-xs mb-8">
            The OTP expires in <strong>10 minutes</strong>. Check your spam folder if you don&apos;t see it.
          </p>
          <Button
            className="w-full"
            onClick={() =>
              navigate('/reset-password', { state: { email: sentTo } })
            }
          >
            Enter OTP &amp; Reset Password
          </Button>
          <button
            type="button"
            onClick={() => setSentTo(null)}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline block mx-auto"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  // ── Form state ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-xl mx-auto flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot password?</h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter your email and we&apos;ll send you a one-time password.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="bg-white rounded-2xl border border-gray-200 shadow-card p-8 space-y-5"
        >
          {errors.root && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {errors.root.message}
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

          <Button type="submit" loading={isSubmitting} className="w-full">
            Send OTP
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Remembered it?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
