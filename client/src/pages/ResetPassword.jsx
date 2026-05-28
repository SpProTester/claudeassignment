import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authService } from '../services/auth.service.js';
import Input from '../components/common/Input.jsx';
import OtpInput from '../components/common/OtpInput.jsx';
import Button from '../components/common/Button.jsx';

const schema = yup.object({
  email: yup.string().email('Enter a valid email address.').required('Email is required.'),
  otp: yup
    .string()
    .matches(/^\d{6}$/, 'OTP must be exactly 6 digits.')
    .required('OTP is required.'),
  newPassword: yup
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .matches(/[0-9]/, 'Password must contain at least one number.')
    .required('New password is required.'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords do not match.')
    .required('Please confirm your password.'),
});

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '', otp: '', newPassword: '', confirmPassword: '' },
  });

  // Pre-fill email from forgot-password navigation state or query string
  useEffect(() => {
    const stateEmail = location.state?.email;
    const queryEmail = new URLSearchParams(location.search).get('email');
    const email = stateEmail || queryEmail;
    if (email) setValue('email', email);
  }, [location, setValue]);

  const onSubmit = async ({ email, otp, newPassword }) => {
    try {
      await authService.resetPassword(email, otp, newPassword);
      setDone(true);
    } catch (err) {
      setError('root', { message: err.message });
    }
  };

  // ── Success state ─────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password reset!</h2>
          <p className="text-gray-500 text-sm mb-8">
            Your password has been updated. All active sessions have been signed out for security.
          </p>
          <Link to="/login">
            <Button className="w-full">Sign in with new password</Button>
          </Link>
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter the OTP from your email and choose a new password.</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="bg-white rounded-2xl border border-gray-200 shadow-card p-8 space-y-6"
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

          {/* OTP */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 text-center">
              Enter 6-digit OTP <span className="text-red-500">*</span>
            </label>
            <Controller
              name="otp"
              control={control}
              render={({ field }) => (
                <OtpInput
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                  error={!!errors.otp}
                />
              )}
            />
            {errors.otp && (
              <p className="text-xs text-red-600 text-center">{errors.otp.message}</p>
            )}
          </div>

          <Input
            id="newPassword"
            type="password"
            label="New password"
            placeholder="Min 8 chars · 1 uppercase · 1 number"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />

          <Input
            id="confirmPassword"
            type="password"
            label="Confirm new password"
            placeholder="Re-enter new password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" loading={isSubmitting} className="w-full">
            Reset Password
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/forgot-password" className="text-primary-600 font-medium hover:underline">
            Resend OTP
          </Link>
          {' · '}
          <Link to="/login" className="text-gray-500 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
