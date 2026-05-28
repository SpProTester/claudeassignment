import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const CATEGORIES = [
  { label: 'Engineering', icon: '⚙️', count: '2.4k jobs' },
  { label: 'Design', icon: '🎨', count: '1.1k jobs' },
  { label: 'Marketing', icon: '📣', count: '890 jobs' },
  { label: 'Sales', icon: '📈', count: '1.5k jobs' },
  { label: 'Finance', icon: '💰', count: '720 jobs' },
  { label: 'Healthcare', icon: '🏥', count: '950 jobs' },
];

export default function Home() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (location) params.set('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-blue-500 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            Find Your Dream Job Today
          </h1>
          <p className="text-primary-100 text-lg mb-10">
            Thousands of opportunities from top companies. Start your journey now.
          </p>

          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-xl"
          >
            <input
              type="text"
              placeholder="Job title, keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-3 text-gray-800 placeholder-gray-400 text-sm outline-none rounded-xl"
            />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 px-4 py-3 text-gray-800 placeholder-gray-400 text-sm outline-none border-l border-gray-100 rounded-xl"
            />
            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-7 py-3 rounded-xl transition-colors text-sm whitespace-nowrap"
            >
              Search Jobs
            </button>
          </form>

          <p className="text-primary-200 text-sm mt-4">
            Popular: <span className="text-white">React Developer</span> ·{' '}
            <span className="text-white">Product Manager</span> ·{' '}
            <span className="text-white">Data Analyst</span>
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Active Jobs', value: '12,400+' },
            { label: 'Companies', value: '3,200+' },
            { label: 'Hired Monthly', value: '8,500+' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-primary-600">{s.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
          <Link to="/jobs" className="text-sm text-primary-600 font-medium hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              to={`/jobs?category=${cat.label}`}
              className="card text-center hover:border-primary-300 hover:bg-primary-50 cursor-pointer"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <p className="font-semibold text-gray-800 text-sm">{cat.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{cat.count}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-50 border-y border-primary-100 py-14">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Hiring? Post Jobs in Minutes
          </h2>
          <p className="text-gray-600 mb-7">
            Reach thousands of qualified candidates. Simple posting, powerful reach.
          </p>
          <Link to="/register?role=employer" className="btn-primary text-base px-8 py-3">
            Post a Job — It&apos;s Free
          </Link>
        </div>
      </section>
    </div>
  );
}
