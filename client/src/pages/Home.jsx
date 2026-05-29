import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobsService } from '../services/jobs.service.js';
import api from '../services/api.js';
import JobCard, { JobCardSkeleton } from '../components/jobs/JobCard.jsx';

/* ─── Category icons fallback map ───────────────────────────────── */
const CAT_ICONS = {
  engineering: '⚙️', technology: '💻', design: '🎨', marketing: '📣',
  sales: '📈', finance: '💰', healthcare: '🏥', education: '📚',
  hr: '👥', legal: '⚖️', operations: '🔧', data: '📊',
};
const catIcon = (name) => CAT_ICONS[name?.toLowerCase()] ?? '💼';

/* ─── Skeleton helpers ──────────────────────────────────────────── */
function CatSkeleton() {
  return (
    <div className="card animate-pulse text-center">
      <div className="w-10 h-10 bg-gray-200 rounded-full mx-auto mb-2" />
      <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-1" />
      <div className="h-2 bg-gray-100 rounded w-1/2 mx-auto" />
    </div>
  );
}

function CompanySkeleton() {
  return <div className="w-24 h-24 rounded-2xl bg-gray-200 animate-pulse shrink-0" />;
}

/* ─── Company logo tile ─────────────────────────────────────────── */
function CompanyTile({ company }) {
  return (
    <Link
      to={`/companies/${company.companySlug}`}
      className="w-24 h-24 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-200 transition-all flex flex-col items-center justify-center gap-1 p-2 shrink-0"
      title={company.companyName}
    >
      {company.logoUrl ? (
        <img src={company.logoUrl} alt={company.companyName} className="w-10 h-10 object-contain" />
      ) : (
        <span className="text-2xl font-bold text-primary-600">
          {company.companyName?.[0]?.toUpperCase()}
        </span>
      )}
      <span className="text-xs text-gray-600 text-center leading-tight line-clamp-2">
        {company.companyName}
      </span>
    </Link>
  );
}

/* ─── Page ──────────────────────────────────────────────────────── */
export default function Home() {
  const [keyword, setKeyword]   = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (keyword.trim())  p.set('keyword',  keyword.trim());
    if (location.trim()) p.set('location', location.trim());
    navigate(`/jobs?${p.toString()}`);
  };

  const handleTrend = (kw) => navigate(`/jobs?keyword=${encodeURIComponent(kw)}`);

  // ── Data fetching ──────────────────────────────────────────────
  const { data: catData, isLoading: catLoading } = useQuery({
    queryKey: ['job-categories'],
    queryFn:  () => jobsService.getCategories(),
    staleTime: 10 * 60 * 1000,
  });

  const { data: recentData, isLoading: recentLoading } = useQuery({
    queryKey: ['recent-jobs-home'],
    queryFn:  () => jobsService.search({ sort_by: 'date', limit: '6' }),
    staleTime: 2 * 60 * 1000,
  });

  const { data: trendData } = useQuery({
    queryKey: ['trending-keywords'],
    queryFn:  () => jobsService.getTrending(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: companyData, isLoading: companiesLoading } = useQuery({
    queryKey: ['featured-companies'],
    queryFn:  () => api.get('/companies', { params: { limit: 8 } }),
    staleTime: 10 * 60 * 1000,
  });

  const categories = catData?.categories ?? [];
  const recentJobs = recentData?.jobs ?? [];
  const trending   = trendData?.keywords ?? [];
  const companies  = companyData?.companies ?? [];

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────── */}
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
              placeholder="Job title, keyword, skill…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-1 px-4 py-3 text-gray-800 placeholder-gray-400 text-sm outline-none rounded-xl"
            />
            <input
              type="text"
              placeholder="City or country"
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

          {/* Trending keywords */}
          {trending.length > 0 ? (
            <p className="text-primary-200 text-sm mt-4 flex flex-wrap justify-center gap-x-2 gap-y-1">
              <span>Trending:</span>
              {trending.slice(0, 5).map((t) => (
                <button
                  key={t.keyword}
                  onClick={() => handleTrend(t.keyword)}
                  className="text-white hover:underline font-medium"
                >
                  {t.keyword}
                </button>
              ))}
            </p>
          ) : (
            <p className="text-primary-200 text-sm mt-4">
              Popular:{' '}
              {['React Developer', 'Product Manager', 'Data Analyst'].map((k, i) => (
                <span key={k}>
                  <button onClick={() => handleTrend(k)} className="text-white hover:underline">
                    {k}
                  </button>
                  {i < 2 && ' · '}
                </span>
              ))}
            </p>
          )}
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Active Jobs',    value: '12,400+' },
            { label: 'Companies',      value: '3,200+' },
            { label: 'Hired Monthly',  value: '8,500+' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-primary-600">{s.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Companies ────────────────────────────────── */}
      {(companiesLoading || companies.length > 0) && (
        <section className="bg-gray-50 border-b border-gray-100 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Top Companies Hiring</h2>
              <Link to="/jobs" className="text-sm text-primary-600 font-medium hover:underline">
                See all jobs →
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {companiesLoading
                ? Array.from({ length: 6 }).map((_, i) => <CompanySkeleton key={i} />)
                : companies.map((c) => <CompanyTile key={c.id} company={c} />)
              }
            </div>
          </div>
        </section>
      )}

      {/* ── Browse by Category ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
          <Link to="/jobs" className="text-sm text-primary-600 font-medium hover:underline">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {catLoading
            ? Array.from({ length: 6 }).map((_, i) => <CatSkeleton key={i} />)
            : categories.length > 0
              ? categories.slice(0, 12).map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/jobs?category_id=${cat.id}`}
                    className="card text-center hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer"
                  >
                    <div className="text-3xl mb-2">{cat.icon || catIcon(cat.name)}</div>
                    <p className="font-semibold text-gray-800 text-sm leading-snug">{cat.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{cat.job_count} jobs</p>
                  </Link>
                ))
              : /* Fallback static categories if none seeded */
                [
                  { label: 'Engineering', icon: '⚙️' },
                  { label: 'Design',      icon: '🎨' },
                  { label: 'Marketing',   icon: '📣' },
                  { label: 'Sales',       icon: '📈' },
                  { label: 'Finance',     icon: '💰' },
                  { label: 'Healthcare',  icon: '🏥' },
                ].map((cat) => (
                  <Link
                    key={cat.label}
                    to={`/jobs?keyword=${cat.label}`}
                    className="card text-center hover:border-primary-300 hover:bg-primary-50 cursor-pointer"
                  >
                    <div className="text-3xl mb-2">{cat.icon}</div>
                    <p className="font-semibold text-gray-800 text-sm">{cat.label}</p>
                  </Link>
                ))
          }
        </div>
      </section>

      {/* ── Recent Jobs ───────────────────────────────────────── */}
      <section className="bg-gray-50 border-y border-gray-100 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Recent Opportunities</h2>
            <Link to="/jobs?sort_by=date" className="text-sm text-primary-600 font-medium hover:underline">
              View all →
            </Link>
          </div>

          {recentLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
            </div>
          ) : recentJobs.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {recentJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">No jobs posted yet. Check back soon!</p>
          )}
        </div>
      </section>

      {/* ── Employer CTA ──────────────────────────────────────── */}
      <section className="bg-primary-50 border-b border-primary-100 py-14">
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
