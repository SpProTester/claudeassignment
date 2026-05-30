import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobsService } from '../services/jobs.service.js';
import api from '../services/api.js';
import JobCard, { JobCardSkeleton } from '../components/jobs/JobCard.jsx';

/* ─── Category icons ──────────────────────────────────────────────── */
const CAT_ICONS = {
  engineering: '⚙️', technology: '💻', design: '🎨', marketing: '📣',
  sales: '📈', finance: '💰', healthcare: '🏥', education: '📚',
  hr: '👥', legal: '⚖️', operations: '🔧', data: '📊',
};
const catIcon = (name) => CAT_ICONS[name?.toLowerCase()] ?? '💼';

/* ─── Static fallback categories ─────────────────────────────────── */
const STATIC_CATS = [
  { label: 'Technology',   icon: '💻', q: 'Technology' },
  { label: 'Design',       icon: '🎨', q: 'Design' },
  { label: 'Marketing',    icon: '📣', q: 'Marketing' },
  { label: 'Finance',      icon: '💰', q: 'Finance' },
  { label: 'Healthcare',   icon: '🏥', q: 'Healthcare' },
  { label: 'Engineering',  icon: '⚙️', q: 'Engineering' },
  { label: 'Sales',        icon: '📈', q: 'Sales' },
  { label: 'Education',    icon: '📚', q: 'Education' },
];

/* ─── Skeleton helpers ──────────────────────────────────────────── */
function CatSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse text-center">
      <div className="w-12 h-12 bg-gray-200 rounded-2xl mx-auto mb-3" />
      <div className="h-3.5 bg-gray-200 rounded w-3/4 mx-auto mb-1.5" />
      <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto" />
    </div>
  );
}

function CompanySkeleton() {
  return <div className="w-20 h-20 rounded-2xl bg-gray-200 animate-pulse shrink-0" />;
}

/* ─── Company logo tile ─────────────────────────────────────────── */
function CompanyTile({ company }) {
  return (
    <Link
      to={`/companies/${company.companySlug}`}
      title={company.companyName}
      className="group flex flex-col items-center justify-center w-32 h-24 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-card hover:border-primary-200 transition-all duration-200 shrink-0 px-3 gap-2"
    >
      {company.logoUrl ? (
        <img src={company.logoUrl} alt={company.companyName} className="w-10 h-10 object-contain" />
      ) : (
        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
          {company.companyName?.[0]?.toUpperCase()}
        </div>
      )}
      <span className="text-xs text-gray-600 text-center leading-tight line-clamp-2 group-hover:text-primary-600 transition-colors">
        {company.companyName}
      </span>
    </Link>
  );
}

/* ─── Stat Card ──────────────────────────────────────────────────── */
function StatCard({ value, label, icon }) {
  return (
    <div className="flex flex-col items-center text-center py-8 px-4">
      <div className="text-4xl font-extrabold text-primary-600 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-500">{label}</div>
    </div>
  );
}

/* ─── Career Advice Card ─────────────────────────────────────────── */
function AdviceCard({ icon, title, desc, to }) {
  return (
    <Link
      to={to}
      className="group bg-white rounded-2xl border border-gray-100 shadow-card p-6 hover:shadow-card-hover hover:border-primary-100 transition-all duration-200"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1.5 group-hover:text-primary-600 transition-colors">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-primary-600">
        Read more
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
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

  /* ── Data ─────────────────────────────────────────────────────── */
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
    queryFn:  () => api.get('/companies', { params: { limit: 10 } }),
    staleTime: 10 * 60 * 1000,
  });

  const categories  = catData?.data?.categories ?? [];
  const recentJobs  = recentData?.jobs ?? [];
  const trending    = trendData?.data?.keywords ?? [];
  const companies   = companyData?.data?.companies ?? [];

  return (
    <div className="bg-white">

      {/* ══════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.03]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            12,400+ Active Jobs Available
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5 tracking-tight">
            Find a Job That <br />
            <span className="text-primary-200">Fits Your Life</span>
          </h1>
          <p className="text-primary-200 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect with top employers. Discover opportunities that match your skills and ambitions.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl max-w-3xl mx-auto"
          >
            {/* Job title input */}
            <div className="flex items-center gap-3 flex-1 px-4 py-1">
              <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Job title, keyword, or company"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-1 text-gray-800 placeholder-gray-400 text-sm bg-transparent outline-none py-2"
              />
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px bg-gray-200 my-2" />

            {/* Location input */}
            <div className="flex items-center gap-3 flex-1 px-4 py-1">
              <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="text"
                placeholder="City, state, or remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 text-gray-800 placeholder-gray-400 text-sm bg-transparent outline-none py-2"
              />
            </div>

            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold px-8 py-3.5 rounded-xl transition-colors text-sm whitespace-nowrap shadow-sm"
            >
              Search Jobs
            </button>
          </form>

          {/* Trending searches */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-primary-300 text-xs font-medium">Trending:</span>
            {(trending.length > 0 ? trending.slice(0, 5).map(t => t.keyword) : ['React Developer', 'Product Manager', 'Data Analyst', 'UI/UX Designer']).map((kw) => (
              <button
                key={kw}
                onClick={() => handleTrend(kw)}
                className="text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1 rounded-full transition-colors font-medium"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════ */}
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 divide-x divide-gray-100">
          <StatCard value="12,400+" label="Active Jobs" />
          <StatCard value="3,200+"  label="Top Companies" />
          <StatCard value="8,500+"  label="Placed Monthly" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TOP COMPANIES
      ══════════════════════════════════════════════════ */}
      {(companiesLoading || companies.length > 0) && (
        <section className="py-14 bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="section-title">Top Companies Hiring Now</h2>
                <p className="section-subtitle">Join the best workplaces in your industry</p>
              </div>
              <Link to="/jobs" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                See all jobs
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {companiesLoading
                ? Array.from({ length: 8 }).map((_, i) => <CompanySkeleton key={i} />)
                : companies.map((c) => <CompanyTile key={c.id} company={c} />)
              }
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════
          BROWSE BY CATEGORY
      ══════════════════════════════════════════════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title">Explore by Category</h2>
              <p className="section-subtitle">Find jobs in your preferred field</p>
            </div>
            <Link to="/jobs" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              All categories
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {catLoading
              ? Array.from({ length: 8 }).map((_, i) => <CatSkeleton key={i} />)
              : categories.length > 0
                ? categories.slice(0, 8).map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/jobs?category_id=${cat.id}`}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-card p-5 text-center hover:shadow-card-hover hover:border-primary-200 hover:bg-primary-50 transition-all duration-200 cursor-pointer"
                    >
                      <div className="text-3xl mb-3">{cat.icon || catIcon(cat.name)}</div>
                      <p className="font-semibold text-gray-800 text-xs leading-snug group-hover:text-primary-700">{cat.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{cat.job_count} jobs</p>
                    </Link>
                  ))
                : STATIC_CATS.map((cat) => (
                    <Link
                      key={cat.label}
                      to={`/jobs?keyword=${cat.q}`}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-card p-5 text-center hover:shadow-card-hover hover:border-primary-200 hover:bg-primary-50 transition-all duration-200 cursor-pointer"
                    >
                      <div className="text-3xl mb-3">{cat.icon}</div>
                      <p className="font-semibold text-gray-800 text-xs group-hover:text-primary-700">{cat.label}</p>
                    </Link>
                  ))
            }
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          RECENT JOBS
      ══════════════════════════════════════════════════ */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title">Latest Job Opportunities</h2>
              <p className="section-subtitle">Freshly posted roles from top employers</p>
            </div>
            <Link to="/jobs?sort_by=date" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all jobs
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {recentLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
            </div>
          ) : recentJobs.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">💼</div>
              <p className="text-gray-500">No jobs posted yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CAREER ADVICE
      ══════════════════════════════════════════════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="section-title">Career Advice & Resources</h2>
            <p className="section-subtitle">Expert tips to help you succeed in your job search</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <AdviceCard icon="📝" title="Resume Writing Tips" desc="Craft a resume that stands out with our expert guide to formatting and keywords." to="/jobs" />
            <AdviceCard icon="🎯" title="Ace Your Interview" desc="Prepare for common questions and make a lasting impression on hiring managers." to="/jobs" />
            <AdviceCard icon="💡" title="Career Switching Guide" desc="Planning a career change? Learn how to transfer your skills to a new field." to="/jobs" />
            <AdviceCard icon="💰" title="Salary Negotiation" desc="Know your worth and negotiate confidently with our step-by-step playbook." to="/jobs" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          RESUME CTA
      ══════════════════════════════════════════════════ */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-5xl mb-5">🚀</div>
          <h2 className="text-3xl font-extrabold text-white mb-4 leading-tight">
            Get Noticed by Top Employers
          </h2>
          <p className="text-primary-200 text-lg mb-8 max-w-xl mx-auto">
            Upload your resume and let employers come to you. Join 500,000+ professionals already on the platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-white text-base px-8 py-3.5 rounded-xl font-bold">
              Upload Your Resume
            </Link>
            <Link to="/jobs" className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border-2 border-white text-white font-bold text-base hover:bg-primary-700 transition-colors">
              Browse Open Roles
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          EMPLOYER CTA
      ══════════════════════════════════════════════════ */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
                FOR EMPLOYERS
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
                Find the Right Talent Fast
              </h2>
              <p className="text-gray-500 text-base max-w-lg">
                Post jobs, manage applications, and hire the best candidates — all in one place. Start free, upgrade as you grow.
              </p>
              <ul className="mt-5 space-y-2.5">
                {['Reach thousands of active job seekers', 'Applicant tracking & pipeline management', 'Smart candidate matching'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-primary-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <Link to="/register?role=employer" className="btn-primary-lg text-center">
                Post a Job — It&apos;s Free
              </Link>
              <Link to="/pricing" className="btn-outline-lg text-center">
                View Pricing Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
