import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { jobsService } from '../services/jobs.service.js';
import { useDebounce } from '../hooks/useDebounce.js';
import JobCard, { JobCardSkeleton } from '../components/jobs/JobCard.jsx';
import { formatSalary } from '../utils/helpers.js';

/* ─── Constants ──────────────────────────────────────────────── */
const JOB_TYPES  = ['full-time', 'part-time', 'contract', 'freelance', 'internship'];
const WORK_MODES = ['onsite', 'remote', 'hybrid'];
const EXP_LEVELS = ['entry', 'mid', 'senior', 'lead', 'executive'];

const SORT_OPTIONS = [
  { value: 'date',      label: 'Newest First' },
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'salary',    label: 'Highest Salary' },
];

const QUICK_CATEGORIES = [
  { icon: '💻', label: 'Software Dev' },
  { icon: '🧪', label: 'QA & Testing' },
  { icon: '📊', label: 'Data Science' },
  { icon: '📱', label: 'Product' },
  { icon: '⚙️', label: 'DevOps' },
  { icon: '🎨', label: 'Design' },
  { icon: '📣', label: 'Marketing' },
  { icon: '💼', label: 'Sales' },
];

function toggle(csv, value) {
  const arr = csv ? csv.split(',') : [];
  return arr.includes(value)
    ? arr.filter(v => v !== value).join(',')
    : [...arr, value].join(',');
}

/* ─── Hero Section ───────────────────────────────────────────── */
function HeroSection({ inputKeyword, setInputKeyword, inputLocation, setInputLocation, onSearch, onQuickCategory, totalJobs, isLoading }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 py-16 lg:py-24">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary-400/20 rounded-full blur-2xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-2xl" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Live badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-semibold px-4 py-2 rounded-full border border-white/20 mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          {isLoading ? 'Loading jobs…' : `${totalJobs > 0 ? `${totalJobs}+` : 'Thousands of'} Jobs Available Now`}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4">
          Find Your{' '}
          <span className="relative inline-block">
            <span className="relative z-10 text-primary-200">Dream Job</span>
            <span className="absolute -bottom-1 left-0 right-0 h-1 bg-primary-300/40 rounded-full" />
          </span>
        </h1>

        <p className="text-primary-100/90 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed font-normal">
          Discover opportunities that match your skills and ambitions. Connect with top companies actively hiring.
        </p>

        {/* Search card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-primary-900/30 p-2 max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Job title, keyword, or skill"
                value={inputKeyword}
                onChange={e => setInputKeyword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSearch()}
                className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-400 text-[15px] focus:outline-none rounded-xl"
              />
            </div>
            <div className="hidden sm:block w-px bg-gray-200 self-stretch my-2" />
            <div className="relative sm:w-52">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <input
                type="text"
                placeholder="City or remote"
                value={inputLocation}
                onChange={e => setInputLocation(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSearch()}
                className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-400 text-[15px] focus:outline-none rounded-xl"
              />
            </div>
            <button
              onClick={onSearch}
              className="btn-primary px-8 py-4 text-[15px] rounded-xl shrink-0 shadow-lg shadow-primary-600/30"
            >
              Search Jobs
            </button>
          </div>
        </div>

        {/* Quick category pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <span className="text-primary-200/70 text-sm self-center mr-1">Popular:</span>
          {QUICK_CATEGORIES.map(cat => (
            <button
              key={cat.label}
              onClick={() => onQuickCategory(cat.label)}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm px-3.5 py-1.5 rounded-full border border-white/20 transition-all duration-150 hover:scale-105 active:scale-95"
            >
              <span className="text-base leading-none">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap justify-center gap-8 sm:gap-12 mt-12">
          {[
            { value: totalJobs > 0 ? `${totalJobs}+` : '500+', label: 'Active Jobs' },
            { value: '150+', label: 'Companies Hiring' },
            { value: '10K+', label: 'Candidates Placed' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{stat.value}</div>
              <div className="text-primary-200/80 text-sm mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Filter CheckGroup ──────────────────────────────────────── */
function CheckGroup({ title, options, param, searchParams, setParam }) {
  const active = searchParams.get(param) || '';
  return (
    <div>
      <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">{title}</h3>
      <div className="space-y-0.5">
        {options.map(opt => {
          const checked = active.split(',').filter(Boolean).includes(opt);
          return (
            <label key={opt} className="flex items-center gap-3 cursor-pointer group rounded-lg px-2 py-1.5 hover:bg-primary-50 transition-colors">
              <div className={`w-[18px] h-[18px] rounded-md flex items-center justify-center shrink-0 border-2 transition-all duration-150 ${
                checked ? 'bg-primary-600 border-primary-600 shadow-sm' : 'border-gray-300 group-hover:border-primary-400'
              }`}>
                {checked && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <input type="checkbox" checked={checked} onChange={() => setParam(param, toggle(active, opt))} className="sr-only" />
              <span className={`text-sm capitalize transition-colors ${checked ? 'text-primary-700 font-semibold' : 'text-gray-600 group-hover:text-primary-600'}`}>
                {opt.replace(/-/g, ' ')}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Salary Inputs ──────────────────────────────────────────── */
function SalaryInputs({ minParam, maxParam, onCommit }) {
  const [minVal, setMinVal] = useState(minParam || '');
  const [maxVal, setMaxVal] = useState(maxParam || '');
  useEffect(() => setMinVal(minParam || ''), [minParam]);
  useEffect(() => setMaxVal(maxParam || ''), [maxParam]);
  const commit = (field, value) => {
    const num = parseInt(value, 10);
    onCommit(field, isNaN(num) || num <= 0 ? '' : String(num));
  };
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-gray-400 block mb-1.5 font-medium">Min (₹)</label>
        <input type="number" min={0} placeholder="e.g. 500000" value={minVal}
          onChange={e => setMinVal(e.target.value)}
          onBlur={e => commit('salary_min', e.target.value)}
          onKeyDown={e => e.key === 'Enter' && commit('salary_min', minVal)}
          className="input-field text-sm py-2.5" />
      </div>
      <div>
        <label className="text-xs text-gray-400 block mb-1.5 font-medium">Max (₹)</label>
        <input type="number" min={0} placeholder="e.g. 2000000" value={maxVal}
          onChange={e => setMaxVal(e.target.value)}
          onBlur={e => commit('salary_max', e.target.value)}
          onKeyDown={e => e.key === 'Enter' && commit('salary_max', maxVal)}
          className="input-field text-sm py-2.5" />
      </div>
    </div>
  );
}

/* ─── Sidebar ────────────────────────────────────────────────── */
function FilterSidebar({ searchParams, setParam, activeTags, clearAll, salaryMinParam, salaryMaxParam }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-primary-50/80 to-white">
        <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filters
        </h2>
        {activeTags.length > 0 && (
          <button onClick={clearAll} className="text-xs text-primary-600 hover:text-primary-700 font-semibold bg-primary-50 px-2.5 py-1 rounded-full transition-colors">
            Clear ({activeTags.length})
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">
        <CheckGroup title="Job Type"    options={JOB_TYPES}  param="job_type"         searchParams={searchParams} setParam={setParam} />
        <div className="border-t border-gray-100" />
        <CheckGroup title="Work Mode"   options={WORK_MODES}  param="work_mode"        searchParams={searchParams} setParam={setParam} />
        <div className="border-t border-gray-100" />
        <CheckGroup title="Experience"  options={EXP_LEVELS}  param="experience_level" searchParams={searchParams} setParam={setParam} />
        <div className="border-t border-gray-100" />
        <div>
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Salary Range</h3>
          <SalaryInputs minParam={salaryMinParam} maxParam={salaryMaxParam} onCommit={setParam} />
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const heroRef = useRef(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const keyword         = searchParams.get('keyword')          || '';
  const location        = searchParams.get('location')         || '';
  const jobType         = searchParams.get('job_type')         || '';
  const workMode        = searchParams.get('work_mode')        || '';
  const experienceLevel = searchParams.get('experience_level') || '';
  const sortBy          = searchParams.get('sort_by')          || 'date';
  const categoryId      = searchParams.get('category_id')      || '';
  const salaryMinParam  = searchParams.get('salary_min')       || '';
  const salaryMaxParam  = searchParams.get('salary_max')       || '';
  const page            = parseInt(searchParams.get('page') || '1', 10);

  const [inputKeyword,  setInputKeyword]  = useState(keyword);
  const [inputLocation, setInputLocation] = useState(location);
  const debouncedKeyword  = useDebounce(inputKeyword,  500);
  const debouncedLocation = useDebounce(inputLocation, 500);

  useEffect(() => { setInputKeyword(keyword);   }, [keyword]);
  useEffect(() => { setInputLocation(location); }, [location]);

  useEffect(() => {
    if (debouncedKeyword === keyword) return;
    setParam('keyword', debouncedKeyword, true);
  }, [debouncedKeyword]);

  useEffect(() => {
    if (debouncedLocation === location) return;
    setParam('location', debouncedLocation, true);
  }, [debouncedLocation]);

  /* Sticky search bar appears when hero search scrolls out of view */
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const setParam = useCallback((key, value, replace = false) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      if (key !== 'page') next.delete('page');
      return next;
    }, { replace });
  }, [setSearchParams]);

  const clearAll = () => setSearchParams({});

  const handleSearch = useCallback((keywordOverride) => {
    const kw = keywordOverride ?? inputKeyword;
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (kw.trim()) next.set('keyword', kw.trim());
      else next.delete('keyword');
      if (inputLocation.trim()) next.set('location', inputLocation.trim());
      else next.delete('location');
      next.delete('page');
      return next;
    });
  }, [inputKeyword, inputLocation, setSearchParams]);

  const handleQuickCategory = useCallback((label) => {
    setInputKeyword(label);
    handleSearch(label);
  }, [handleSearch]);

  const activeTags = [
    keyword         && { id: 'keyword',  label: `"${keyword}"`,                             clear: () => setParam('keyword', '') },
    location        && { id: 'location', label: `📍 ${location}`,                           clear: () => setParam('location', '') },
    sortBy !== 'date' && { id: 'sort',   label: `Sort: ${sortBy}`,                           clear: () => setParam('sort_by', '') },
    categoryId      && { id: 'cat',      label: 'Category',                                  clear: () => setParam('category_id', '') },
    salaryMinParam  && { id: 'smin',     label: `Min ${formatSalary(+salaryMinParam, null)}`, clear: () => setParam('salary_min', '') },
    salaryMaxParam  && { id: 'smax',     label: `Max ${formatSalary(null, +salaryMaxParam)}`, clear: () => setParam('salary_max', '') },
    ...jobType.split(',').filter(Boolean).map(t => ({
      id: `jt-${t}`, label: t.replace(/-/g, ' '), clear: () => setParam('job_type', toggle(jobType, t)),
    })),
    ...workMode.split(',').filter(Boolean).map(m => ({
      id: `wm-${m}`, label: m, clear: () => setParam('work_mode', toggle(workMode, m)),
    })),
    ...experienceLevel.split(',').filter(Boolean).map(l => ({
      id: `el-${l}`, label: `${l} level`, clear: () => setParam('experience_level', toggle(experienceLevel, l)),
    })),
  ].filter(Boolean);

  const queryParams = {
    keyword:          keyword         || undefined,
    location:         location        || undefined,
    job_type:         jobType         || undefined,
    work_mode:        workMode        || undefined,
    experience_level: experienceLevel || undefined,
    sort_by:          sortBy,
    category_id:      categoryId      || undefined,
    salary_min:       salaryMinParam  || undefined,
    salary_max:       salaryMaxParam  || undefined,
    page,
    limit: 10,
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey:        ['jobs', queryParams],
    queryFn:         () => jobsService.search(queryParams),
    placeholderData: keepPreviousData,
    staleTime:       30 * 1000,
  });

  const jobs       = data?.jobs ?? [];
  const pagination = data?.pagination;
  const totalJobs  = pagination?.total ?? 0;
  const totalPages = pagination?.pages ?? 0;

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div ref={heroRef}>
        <HeroSection
          inputKeyword={inputKeyword}
          setInputKeyword={setInputKeyword}
          inputLocation={inputLocation}
          setInputLocation={setInputLocation}
          onSearch={handleSearch}
          onQuickCategory={handleQuickCategory}
          totalJobs={totalJobs}
          isLoading={isLoading}
        />
      </div>

      {/* ── Sticky search bar (below navbar h-16) ─────────────── */}
      {showStickyBar && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-nav py-2.5 animate-slide-up">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Job title, keyword, or skill"
                value={inputKeyword}
                onChange={e => setInputKeyword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="input-field pl-10 py-2.5 text-sm"
              />
            </div>
            <div className="relative hidden sm:block sm:w-44">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <input
                type="text"
                placeholder="City or remote"
                value={inputLocation}
                onChange={e => setInputLocation(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="input-field pl-10 py-2.5 text-sm"
              />
            </div>
            <button onClick={handleSearch} className="btn-primary py-2.5 px-5 text-sm shrink-0">
              Search
            </button>
          </div>
        </div>
      )}

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Active filter tags */}
        {activeTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-white rounded-2xl border border-gray-100 shadow-card">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-1">Active filters:</span>
            {activeTags.map(tag => (
              <span key={tag.id} className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs px-3 py-1.5 rounded-full border border-primary-200 font-medium">
                {tag.label}
                <button onClick={tag.clear} className="hover:text-red-500 transition-colors font-bold leading-none ml-0.5">×</button>
              </span>
            ))}
            <button onClick={clearAll} className="ml-auto text-xs text-red-500 hover:text-red-600 font-semibold px-3 py-1.5 hover:bg-red-50 rounded-full transition-colors">
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-6">

          {/* ── Desktop Sidebar ────────────────────────────── */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <FilterSidebar
                searchParams={searchParams}
                setParam={setParam}
                activeTags={activeTags}
                clearAll={clearAll}
                salaryMinParam={salaryMinParam}
                salaryMaxParam={salaryMaxParam}
              />
            </div>
          </aside>

          {/* ── Mobile filter overlay ──────────────────────── */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
              <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl overflow-y-auto animate-slide-up">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900 text-lg">Filter Jobs</h2>
                  <button onClick={() => setMobileFiltersOpen(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500">✕</button>
                </div>
                <div className="p-5">
                  <FilterSidebar
                    searchParams={searchParams}
                    setParam={setParam}
                    activeTags={activeTags}
                    clearAll={() => { clearAll(); setMobileFiltersOpen(false); }}
                    salaryMinParam={salaryMinParam}
                    salaryMaxParam={salaryMaxParam}
                  />
                </div>
                <div className="p-5 border-t border-gray-100">
                  <button onClick={() => setMobileFiltersOpen(false)} className="btn-primary w-full">
                    Show Results
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Results ────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Results header */}
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                {/* Mobile filter button */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden btn-outline py-2 px-3 text-sm flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                  </svg>
                  Filters
                  {activeTags.length > 0 && (
                    <span className="bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {activeTags.length}
                    </span>
                  )}
                </button>

                {isLoading ? (
                  <div className="h-5 w-36 bg-gray-200 rounded-lg animate-pulse" />
                ) : (
                  <p className="text-sm text-gray-500">
                    {isFetching && !isLoading && (
                      <span className="inline-block w-3.5 h-3.5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mr-2 align-middle" />
                    )}
                    <span className="font-bold text-gray-900 text-base">{totalJobs}</span>
                    {' '}job{totalJobs !== 1 ? 's' : ''} found
                    {keyword && <span className="text-primary-600"> for &ldquo;{keyword}&rdquo;</span>}
                  </p>
                )}
              </div>

              <select
                value={sortBy}
                onChange={e => setParam('sort_by', e.target.value)}
                className="input-field w-auto py-2.5 text-sm cursor-pointer shrink-0"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Job list */}
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-card">
                <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="font-bold text-gray-900 text-xl mb-2">No jobs match your search</p>
                <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
                  Try adjusting your filters or searching with different keywords.
                </p>
                <button onClick={clearAll} className="btn-outline">Clear All Filters</button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {jobs.map(job => <JobCard key={job.id} job={job} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-10">
                    <button
                      disabled={page <= 1}
                      onClick={() => setParam('page', page - 1)}
                      className="w-10 h-10 rounded-xl border border-gray-200 bg-white hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let p;
                      if (totalPages <= 7) p = i + 1;
                      else if (page <= 4) p = i < 6 ? i + 1 : totalPages;
                      else if (page >= totalPages - 3) p = i === 0 ? 1 : totalPages - 6 + i;
                      else p = i === 0 ? 1 : i === 6 ? totalPages : page - 3 + i;
                      const isEllipsis = (i === 1 && p !== 2) || (i === 5 && p !== totalPages - 1);
                      return isEllipsis ? (
                        <span key={`e${i}`} className="px-1 text-sm text-gray-400">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setParam('page', p === 1 ? '' : p)}
                          className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                            p === page
                              ? 'bg-primary-600 text-white shadow-sm shadow-primary-200'
                              : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}

                    <button
                      disabled={page >= totalPages}
                      onClick={() => setParam('page', page + 1)}
                      className="w-10 h-10 rounded-xl border border-gray-200 bg-white hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
