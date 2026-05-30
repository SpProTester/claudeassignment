import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { jobsService } from '../services/jobs.service.js';
import { useDebounce } from '../hooks/useDebounce.js';
import JobCard, { JobCardSkeleton } from '../components/jobs/JobCard.jsx';
import { formatSalary } from '../utils/helpers.js';

/* ─── Filter constants ──────────────────────────────────────────── */
const JOB_TYPES  = ['full-time', 'part-time', 'contract', 'freelance', 'internship'];
const WORK_MODES = ['onsite', 'remote', 'hybrid'];
const EXP_LEVELS = ['entry', 'mid', 'senior', 'lead', 'executive'];
const SORT_OPTIONS = [
  { value: 'date',      label: 'Newest First' },
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'salary',    label: 'Highest Salary' },
];

function toggle(csv, value) {
  const arr = csv ? csv.split(',') : [];
  return arr.includes(value)
    ? arr.filter(v => v !== value).join(',')
    : [...arr, value].join(',');
}

/* ─── Filter checkbox group ─────────────────────────────────────── */
function CheckGroup({ title, options, param, searchParams, setParam }) {
  const active = searchParams.get(param) || '';
  return (
    <div>
      <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">{title}</h3>
      <div className="space-y-2">
        {options.map((opt) => {
          const checked = active.split(',').includes(opt);
          return (
            <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
              <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border-2 transition-colors ${
                checked ? 'bg-primary-600 border-primary-600' : 'border-gray-300 group-hover:border-primary-400'
              }`}>
                {checked && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => setParam(param, toggle(active, opt))}
                className="sr-only"
              />
              <span className={`text-sm capitalize transition-colors ${
                checked ? 'text-primary-700 font-semibold' : 'text-gray-600 group-hover:text-primary-600'
              }`}>
                {opt.replace(/-/g, ' ')}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Salary inputs ─────────────────────────────────────────────── */
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
        <label className="text-xs text-gray-500 block mb-1.5 font-medium">Min Salary (₹)</label>
        <input
          type="number" min={0} placeholder="e.g. 500000"
          value={minVal}
          onChange={(e) => setMinVal(e.target.value)}
          onBlur={(e) => commit('salary_min', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && commit('salary_min', minVal)}
          className="input-field text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1.5 font-medium">Max Salary (₹)</label>
        <input
          type="number" min={0} placeholder="e.g. 2000000"
          value={maxVal}
          onChange={(e) => setMaxVal(e.target.value)}
          onBlur={(e) => commit('salary_max', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && commit('salary_max', maxVal)}
          className="input-field text-sm"
        />
      </div>
    </div>
  );
}

/* ─── Active filter tag ─────────────────────────────────────────── */
function FilterTag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs px-3 py-1.5 rounded-full border border-primary-200 font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-red-500 transition-colors leading-none font-bold text-sm">×</button>
    </span>
  );
}

/* ─── Sidebar content ───────────────────────────────────────────── */
function SidebarContent({ searchParams, setParam, activeTags, clearAll, salaryMinParam, salaryMaxParam }) {
  return (
    <div className="space-y-6">
      <CheckGroup title="Job Type"    options={JOB_TYPES}  param="job_type"         searchParams={searchParams} setParam={setParam} />
      <div className="border-t border-gray-100" />
      <CheckGroup title="Work Mode"   options={WORK_MODES}  param="work_mode"        searchParams={searchParams} setParam={setParam} />
      <div className="border-t border-gray-100" />
      <CheckGroup title="Experience"  options={EXP_LEVELS}  param="experience_level" searchParams={searchParams} setParam={setParam} />
      <div className="border-t border-gray-100" />
      <div>
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Salary Range</h3>
        <SalaryInputs minParam={salaryMinParam} maxParam={salaryMaxParam} onCommit={setParam} />
      </div>
      {activeTags.length > 0 && (
        <>
          <div className="border-t border-gray-100" />
          <button
            onClick={clearAll}
            className="w-full text-sm text-red-500 hover:text-red-600 hover:bg-red-50 py-2 rounded-xl font-medium transition-colors"
          >
            Clear all filters
          </button>
        </>
      )}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────── */
export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  const setParam = useCallback((key, value, replace = false) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      next.delete('page');
      return next;
    }, { replace });
  }, [setSearchParams]);

  const clearAll = () => setSearchParams({});

  const activeTags = [
    keyword         && { id: 'keyword',   label: `"${keyword}"`,    clear: () => setParam('keyword', '') },
    location        && { id: 'location',  label: `📍 ${location}`,  clear: () => setParam('location', '') },
    sortBy !== 'date' && { id: 'sort',    label: `Sort: ${sortBy}`, clear: () => setParam('sort_by', '') },
    categoryId      && { id: 'cat',       label: 'Category',        clear: () => setParam('category_id', '') },
    salaryMinParam  && { id: 'smin',      label: `Min ${formatSalary(+salaryMinParam, null)}`, clear: () => setParam('salary_min', '') },
    salaryMaxParam  && { id: 'smax',      label: `Max ${formatSalary(null, +salaryMaxParam)}`, clear: () => setParam('salary_max', '') },
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
  const totalPages = pagination?.pages ?? 0;

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Search header band ──────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-sm py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Keyword */}
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Job title, keyword, or company"
                value={inputKeyword}
                onChange={e => setInputKeyword(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            {/* Location */}
            <div className="relative sm:w-56">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <input
                type="text"
                placeholder="City or remote"
                value={inputLocation}
                onChange={e => setInputLocation(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setParam('sort_by', e.target.value)}
              className="input-field sm:w-48 cursor-pointer"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {/* Mobile filter button */}
            <button
              onClick={() => setMobileFiltersOpen(o => !o)}
              className="lg:hidden btn-outline flex items-center gap-2 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2" />
              </svg>
              Filters
              {activeTags.length > 0 && (
                <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {activeTags.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Active filter tags */}
        {activeTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {activeTags.map(tag => (
              <FilterTag key={tag.id} label={tag.label} onRemove={tag.clear} />
            ))}
            <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-600 font-semibold self-center px-2">
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-6">
          {/* ── Desktop Sidebar ──────────────────────────── */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2" />
                  </svg>
                  Filters
                </h2>
                {activeTags.length > 0 && (
                  <span className="text-xs bg-primary-100 text-primary-700 font-bold px-2 py-0.5 rounded-full">
                    {activeTags.length}
                  </span>
                )}
              </div>
              <SidebarContent
                searchParams={searchParams}
                setParam={setParam}
                activeTags={activeTags}
                clearAll={clearAll}
                salaryMinParam={salaryMinParam}
                salaryMaxParam={salaryMaxParam}
              />
            </div>
          </aside>

          {/* ── Mobile Sidebar overlay ──────────────────── */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
              <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl overflow-y-auto animate-slide-up">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900 text-lg">Filter Jobs</h2>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-5">
                  <SidebarContent
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

          {/* ── Results ─────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Results count */}
            <div className="flex items-center justify-between mb-4 min-h-[28px]">
              {isLoading ? (
                <div className="h-4 w-40 bg-gray-200 rounded-lg animate-pulse" />
              ) : (
                <p className="text-sm text-gray-500">
                  {isFetching && !isLoading && (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mr-2 align-middle" />
                  )}
                  <span className="font-bold text-gray-900 text-base">{pagination?.total ?? 0}</span>
                  {' '}job{pagination?.total !== 1 ? 's' : ''} found
                  {keyword && <span className="text-primary-600"> for &quot;{keyword}&quot;</span>}
                </p>
              )}
            </div>

            {/* Job list */}
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 7 }).map((_, i) => <JobCardSkeleton key={i} />)}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-card">
                <div className="text-5xl mb-4">🔍</div>
                <p className="font-bold text-gray-900 text-xl mb-2">No jobs match your search</p>
                <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                  Try adjusting your filters or searching with different keywords.
                </p>
                <button onClick={clearAll} className="btn-outline">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {jobs.map(job => <JobCard key={job.id} job={job} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-8">
                    <button
                      disabled={page <= 1}
                      onClick={() => setParam('page', page - 1)}
                      className="w-9 h-9 rounded-xl border border-gray-200 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 transition-colors"
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
                        <span key={`e${i}`} className="px-2 text-sm text-gray-400">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setParam('page', p === 1 ? '' : p)}
                          className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                            p === page
                              ? 'bg-primary-600 text-white shadow-sm'
                              : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}

                    <button
                      disabled={page >= totalPages}
                      onClick={() => setParam('page', page + 1)}
                      className="w-9 h-9 rounded-xl border border-gray-200 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 transition-colors"
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
