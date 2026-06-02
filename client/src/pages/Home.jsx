import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobsService } from '../services/jobs.service.js';
import api from '../services/api.js';
import JobCard, { JobCardSkeleton } from '../components/jobs/JobCard.jsx';

/* ─── Category icons & colors ─────────────────────────────────────── */
const CAT_ICONS = {
  engineering: '⚙️', technology: '💻', design: '🎨', marketing: '📣',
  sales: '📈', finance: '💰', healthcare: '🏥', education: '📚',
  hr: '👥', legal: '⚖️', operations: '🔧', data: '📊',
};
const catIcon = (name) => CAT_ICONS[name?.toLowerCase()] ?? '💼';

const CAT_COLORS = [
  'bg-violet-100 text-violet-600 group-hover:bg-violet-200',
  'bg-blue-100 text-blue-600 group-hover:bg-blue-200',
  'bg-rose-100 text-rose-600 group-hover:bg-rose-200',
  'bg-amber-100 text-amber-600 group-hover:bg-amber-200',
  'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200',
  'bg-cyan-100 text-cyan-600 group-hover:bg-cyan-200',
  'bg-orange-100 text-orange-600 group-hover:bg-orange-200',
  'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200',
];

/* ─── Static fallback data ────────────────────────────────────────── */
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

const TESTIMONIALS = [
  {
    name: 'Sarah Chen', initials: 'SC', role: 'Software Engineer', company: 'Google',
    quote: 'Found my dream job in just 3 weeks. The matching was spot-on for my skills and the application tracker kept me organized throughout.',
    rating: 5, gradient: 'from-violet-500 to-primary-600',
  },
  {
    name: 'Marcus Johnson', initials: 'MJ', role: 'Product Manager', company: 'Stripe',
    quote: 'Landed an offer 40% above my previous salary. The salary tools gave me real data to negotiate confidently. Absolutely game-changing.',
    rating: 5, gradient: 'from-blue-500 to-cyan-600',
  },
  {
    name: 'Priya Patel', initials: 'PP', role: 'UX Designer', company: 'Airbnb',
    quote: "Best platform I've used. Career advice resources genuinely helped me prepare for interviews. Worth every minute spent here.",
    rating: 5, gradient: 'from-emerald-500 to-teal-600',
  },
];

const ADVICE_CARDS = [
  { icon: '📝', title: 'Resume Writing Tips', desc: 'Craft a resume that gets past ATS and into human hands with our expert formatting guide.', to: '/career-advice', accent: 'bg-violet-100' },
  { icon: '🎯', title: 'Ace Your Interview', desc: 'Prepare for tough questions and make a lasting impression on every hiring manager you meet.', to: '/career-advice', accent: 'bg-blue-100' },
  { icon: '💡', title: 'Career Switching Guide', desc: 'Planning a pivot? Learn how to position your transferable skills for maximum impact in a new field.', to: '/career-advice', accent: 'bg-amber-100' },
  { icon: '💰', title: 'Salary Negotiation', desc: 'Know your market worth and negotiate confidently with our data-driven step-by-step playbook.', to: '/salary-tools', accent: 'bg-emerald-100' },
];

/* ─── Skeleton helpers ────────────────────────────────────────────── */
function CatSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse text-center">
      <div className="w-14 h-14 bg-gray-200 rounded-2xl mx-auto mb-4" />
      <div className="h-3.5 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto" />
    </div>
  );
}

function CompanySkeleton() {
  return <div className="w-36 h-20 rounded-2xl bg-gray-200 animate-pulse shrink-0" />;
}

/* ─── Company logo tile ───────────────────────────────────────────── */
function CompanyTile({ company }) {
  return (
    <Link
      to={`/companies/${company.companySlug}`}
      title={company.companyName}
      className="group flex flex-col items-center justify-center w-36 h-24 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-card hover:border-primary-200 hover:-translate-y-0.5 transition-all duration-200 shrink-0 px-4 gap-2"
    >
      {company.logoUrl ? (
        <img src={company.logoUrl} alt={company.companyName} className="h-8 w-auto object-contain" />
      ) : (
        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
          {company.companyName?.[0]?.toUpperCase()}
        </div>
      )}
      <span className="text-xs text-gray-500 text-center leading-tight line-clamp-2 group-hover:text-primary-600 transition-colors font-medium">
        {company.companyName}
      </span>
    </Link>
  );
}

/* ─── Star Rating ─────────────────────────────────────────────────── */
function StarRating({ count = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ─── Advice Card ─────────────────────────────────────────────────── */
function AdviceCard({ icon, title, desc, to, accent }) {
  return (
    <Link
      to={to}
      className="group bg-white rounded-2xl border border-gray-100 shadow-card p-6 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 flex flex-col"
    >
      <div className={`w-12 h-12 rounded-xl ${accent} flex items-center justify-center text-2xl mb-5`}>
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors text-sm leading-snug">
        {title}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed flex-1">{desc}</p>
      <span className="inline-flex items-center gap-1.5 mt-5 text-xs font-bold text-primary-600 group-hover:gap-2.5 transition-all duration-150">
        Read article
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}

/* ─── ChevronRight icon ───────────────────────────────────────────── */
function ChevRight() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

/* ─── Section link ────────────────────────────────────────────────── */
function SectionLink({ to, children }) {
  return (
    <Link to={to} className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 shrink-0 transition-colors">
      {children}
      <ChevRight />
    </Link>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */
export default function Home() {
  const [keyword, setKeyword]       = useState('');
  const [location, setLocation]     = useState('');
  const [showSugg, setShowSugg]     = useState(false);
  const [debouncedQ, setDebouncedQ] = useState('');
  const suggRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(keyword.trim()), 300);
    return () => clearTimeout(t);
  }, [keyword]);

  useEffect(() => {
    const handler = (e) => {
      if (suggRef.current && !suggRef.current.contains(e.target)) setShowSugg(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: suggData } = useQuery({
    queryKey: ['job-suggestions', debouncedQ],
    queryFn:  () => jobsService.getSuggestions(debouncedQ),
    enabled:  debouncedQ.length >= 2,
    staleTime: 30 * 1000,
  });
  const suggestions = suggData?.data?.suggestions ?? [];

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSugg(false);
    const p = new URLSearchParams();
    if (keyword.trim())  p.set('keyword',  keyword.trim());
    if (location.trim()) p.set('location', location.trim());
    navigate(`/jobs?${p.toString()}`);
  };

  const handleTrend = (kw) => navigate(`/jobs?keyword=${encodeURIComponent(kw)}`);

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

  const categories = catData?.data?.categories ?? [];
  const recentJobs = recentData?.jobs ?? [];
  const trending   = trendData?.data?.keywords ?? [];
  const companies  = companyData?.data?.companies ?? [];

  return (
    <div className="bg-white">

      {/* ══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #12002b 0%, #3a005c 40%, #7600CF 100%)' }}>
        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        {/* Ambient glow blobs */}
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-primary-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary-900/30 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center">

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white text-xs font-semibold mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            12,400+ positions actively hiring right now
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6">
            Find Work That<br />
            <span className="text-primary-200">Moves You Forward</span>
          </h1>

          <p className="text-primary-100/80 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            Connect with thousands of top employers. Discover roles that match your skills, values, and ambitions.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto"
            style={{ boxShadow: '0 25px 60px -10px rgba(0,0,0,0.4), 0 8px 20px -8px rgba(118,0,207,0.3)' }}
          >
            {/* Keyword input */}
            <div className="relative flex items-center gap-3 flex-1 px-4 py-1" ref={suggRef}>
              <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Job title, keyword, or company"
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setShowSugg(true); }}
                onFocus={() => setShowSugg(true)}
                className="flex-1 text-gray-800 placeholder-gray-400 text-sm bg-transparent outline-none py-2.5 font-medium"
                autoComplete="off"
              />
              {showSugg && suggestions.length > 0 && (
                <ul className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  {suggestions.map((s, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 flex items-center gap-3"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setKeyword(s.term);
                          setShowSugg(false);
                        }}
                      >
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={
                            s.type === 'company'
                              ? 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                              : 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                          } />
                        </svg>
                        <span className="flex-1">{s.term}</span>
                        <span className="text-xs text-gray-400 capitalize">{s.type}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="hidden sm:block w-px bg-gray-200 self-stretch my-2" />

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
                className="flex-1 text-gray-800 placeholder-gray-400 text-sm bg-transparent outline-none py-2.5 font-medium"
              />
            </div>

            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold px-8 py-3.5 rounded-xl transition-colors text-sm whitespace-nowrap shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Search Jobs
            </button>
          </form>

          {/* Trending searches */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            <span className="text-primary-300/80 text-xs font-semibold">Trending:</span>
            {(trending.length > 0
              ? trending.slice(0, 5).map((t) => t.keyword)
              : ['React Developer', 'Product Manager', 'Data Analyst', 'UI/UX Designer', 'DevOps Engineer']
            ).map((kw) => (
              <button
                key={kw}
                onClick={() => handleTrend(kw)}
                className="text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1.5 rounded-full transition-colors font-medium"
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
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">
          {[
            { value: '12,400+', label: 'Active Jobs',      icon: '💼', bg: 'bg-violet-50' },
            { value: '3,200+',  label: 'Top Companies',    icon: '🏢', bg: 'bg-blue-50' },
            { value: '8,500+',  label: 'Monthly Hires',    icon: '✅', bg: 'bg-emerald-50' },
            { value: '500K+',   label: 'Registered Users', icon: '👤', bg: 'bg-amber-50' },
          ].map(({ value, label, icon, bg }) => (
            <div key={label} className="flex flex-col items-center text-center py-8 px-4">
              <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center text-xl mb-3`}>
                {icon}
              </div>
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight mb-0.5">{value}</div>
              <div className="text-xs font-medium text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TOP COMPANIES
      ══════════════════════════════════════════════════ */}
      {(companiesLoading || companies.length > 0) && (
        <section className="py-16 bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="section-eyebrow">NOW HIRING</p>
                <h2 className="section-title">Top Companies Hiring Now</h2>
                <p className="section-subtitle">Join the best workplaces across every industry</p>
              </div>
              <SectionLink to="/jobs">Explore all jobs</SectionLink>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="section-eyebrow">EXPLORE OPPORTUNITIES</p>
              <h2 className="section-title">Browse by Category</h2>
              <p className="section-subtitle">Find roles in your preferred field</p>
            </div>
            <SectionLink to="/jobs">All categories</SectionLink>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {catLoading
              ? Array.from({ length: 8 }).map((_, i) => <CatSkeleton key={i} />)
              : categories.length > 0
                ? categories.slice(0, 8).map((cat, idx) => (
                    <Link
                      key={cat.id}
                      to={`/jobs?category_id=${cat.id}`}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-card p-6 text-center hover:shadow-card-hover hover:border-primary-100 hover:-translate-y-1 transition-all duration-200"
                    >
                      <div className={`w-14 h-14 rounded-2xl ${CAT_COLORS[idx % CAT_COLORS.length]} flex items-center justify-center text-2xl mb-4 mx-auto transition-all duration-200`}>
                        {cat.icon || catIcon(cat.name)}
                      </div>
                      <p className="font-semibold text-gray-800 text-sm leading-snug group-hover:text-primary-700 transition-colors">
                        {cat.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1.5 font-medium">
                        {cat.job_count ?? 0} {cat.job_count === 1 ? 'opening' : 'openings'}
                      </p>
                    </Link>
                  ))
                : STATIC_CATS.map((cat, idx) => (
                    <Link
                      key={cat.label}
                      to={`/jobs?keyword=${cat.q}`}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-card p-6 text-center hover:shadow-card-hover hover:border-primary-100 hover:-translate-y-1 transition-all duration-200"
                    >
                      <div className={`w-14 h-14 rounded-2xl ${CAT_COLORS[idx % CAT_COLORS.length]} flex items-center justify-center text-2xl mb-4 mx-auto transition-all duration-200`}>
                        {cat.icon}
                      </div>
                      <p className="font-semibold text-gray-800 text-sm group-hover:text-primary-700 transition-colors">
                        {cat.label}
                      </p>
                    </Link>
                  ))
            }
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          RECENT JOBS
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="section-eyebrow">JUST POSTED</p>
              <h2 className="section-title">Latest Opportunities</h2>
              <p className="section-subtitle">Fresh roles from verified employers</p>
            </div>
            <SectionLink to="/jobs?sort_by=date">View all jobs</SectionLink>
          </div>

          {recentLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
            </div>
          ) : recentJobs.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentJobs.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">💼</div>
              <p className="text-gray-500 font-medium">No jobs posted yet — check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CAREER RESOURCES
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="section-eyebrow">EXPERT GUIDANCE</p>
              <h2 className="section-title">Career Resources</h2>
              <p className="section-subtitle">Tools and insights to accelerate your search</p>
            </div>
            <SectionLink to="/career-advice">All resources</SectionLink>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ADVICE_CARDS.map((card) => <AdviceCard key={card.title} {...card} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-surface-muted border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-eyebrow">SUCCESS STORIES</p>
            <h2 className="section-title">Loved by Job Seekers</h2>
            <p className="section-subtitle">Real people, real results — from our community</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl border border-gray-100 shadow-card p-7 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 flex flex-col"
              >
                <StarRating count={t.rating} />
                <p className="text-gray-600 text-sm leading-relaxed mt-4 mb-6 flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role} · {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          RESUME CTA
      ══════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4d007d 0%, #7600CF 50%, #8b35f7 100%)' }}>
        {/* Dot texture */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-primary-900/20 blur-2xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white/90 text-xs font-semibold mb-6">
            🚀 Join 500,000+ professionals
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight tracking-tight">
            Get Noticed by<br />Top Employers
          </h2>
          <p className="text-primary-100/80 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Upload your resume and let the right opportunities find you. It's free and takes less than 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-primary-700 font-bold text-base hover:bg-primary-50 transition-colors shadow-lg"
            >
              Upload Your Resume
            </Link>
            <Link
              to="/jobs"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-white/30 text-white font-bold text-base hover:bg-white/10 transition-colors"
            >
              Browse Open Roles
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          EMPLOYER CTA
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
            <div className="p-10 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="text-center lg:text-left max-w-lg">
                <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1.5 rounded-full mb-5 tracking-wide">
                  FOR EMPLOYERS
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
                  Find the Right Talent, Fast
                </h2>
                <p className="text-gray-500 text-base leading-relaxed">
                  Post jobs, manage applications, and hire top candidates — all in one powerful platform. Start free, upgrade as you grow.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    'Reach thousands of active job seekers daily',
                    'Applicant tracking & smart pipeline management',
                    'AI-powered candidate matching & screening',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-3 shrink-0 w-full lg:w-auto min-w-[200px]">
                <Link to="/register?role=employer" className="btn-primary-lg text-center">
                  Post a Job — It&apos;s Free
                </Link>
                <Link to="/pricing" className="btn-outline-lg text-center">
                  View Pricing Plans
                </Link>
                <p className="text-xs text-center text-gray-400 mt-1">No credit card required</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
