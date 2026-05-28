import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../hooks/useAuth.js';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';

const schema = yup.object({
  role: yup.string().oneOf(['seeker', 'employer']).required(),
  fullName: yup
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters.')
    .max(200, 'Full name must be at most 200 characters.')
    .required('Full name is required.'),
  email: yup.string().email('Enter a valid email address.').required('Email is required.'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .matches(/[0-9]/, 'Password must contain at least one number.')
    .required('Password is required.'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match.')
    .required('Please confirm your password.'),
});

const ROLES = [
  { value: 'seeker', label: 'Job Seeker', icon: '🔍' },
  { value: 'employer', label: 'Employer', icon: '🏢' },
];

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: 'seeker', fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async ({ confirmPassword: _, ...payload }) => {
    try {
      await registerUser(payload);
      navigate('/dashboard');
    } catch (err) {
      setError('root', { message: err.message });
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
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join thousands finding their next opportunity</p>
        </div>

        {/* Form */}
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

          {/* Role toggle — Controller ensures RHF tracks this value properly */}
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">I am a…</p>
                <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                  {ROLES.map(({ value, label, icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                        field.value === value
                          ? 'bg-white text-primary-700 shadow-sm ring-1 ring-gray-200'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <span role="img" aria-hidden="true">{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          />

          <Input
            id="fullName"
            label="Full name"
            placeholder="Jane Smith"
            autoComplete="name"
            error={errors.fullName?.message}
            {...register('fullName')}
          />

          <Input
            id="email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="Min 8 chars · 1 uppercase · 1 number"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            id="confirmPassword"
            type="password"
            label="Confirm password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" loading={isSubmitting} className="w-full">
            Create Account
          </Button>

          <p className="text-xs text-gray-400 text-center">
            By creating an account, you agree to our Terms of Service.
          </p>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
