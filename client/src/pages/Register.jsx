import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'seeker',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-xl mx-auto flex items-center justify-center mb-4">
            <span className="text-white font-bold text-lg">JP</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join thousands finding their next opportunity</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-card p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Role toggle */}
          <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
            {['seeker', 'employer'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: r }))}
                className={`py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                  form.role === r
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r === 'seeker' ? 'Job Seeker' : 'Employer'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="firstName"
              name="firstName"
              label="First name"
              placeholder="John"
              value={form.firstName}
              onChange={handleChange}
              required
            />
            <Input
              id="lastName"
              name="lastName"
              label="Last name"
              placeholder="Doe"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <Input
            id="email"
            name="email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />

          <Button type="submit" loading={loading} className="w-full">
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
