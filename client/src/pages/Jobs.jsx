import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
  { value: 'date',      label: 'Newest first' },
  { value: 'relevance', label: 'Most relevant' },
  { value: 'salary',    label: 'Highest salary' },
];
/* ─── Helpers ───────────────────────────────────────────────────── */
function toggle(csv, value) {
  const arr = csv ? csv.split(',') : [];
  return arr.includes(value)
    ? arr.filter(v => v !== value).join(',')
    : [...arr, value].join(',');
}

function CheckGroup({ title, options, param, searchParams, setParam }) {
  const active = searchParams.get(param) || '';
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      <div className="space-y-1.5">
        {options.map((opt) => {
          const checked = active.split(',').includes(opt);
          return (
            <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => setParam(param, toggle(active, opt))}
                className="w-4 h-4 accent-primary-600 rounded"
              />
              <span className={`text-sm capitalize transition-colors ${checked ? 'text-primary-700 font-medium' : 'text-gray-700 group-hover:text-primary-600'}`}>
                {opt}
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

  // Reset when the URL param is cleared externally (e.g. "Clear all")
  useEffect(() => setMinVal(minParam || ''), [minParam]);
  useEffect(() => setMaxVal(maxParam || ''), [maxParam]);

  const commit = (field, value) => {
    const num = parseInt(value, 10);
    onCommit(field, isNaN(num) || num <= 0 ? '' : String(num));
  };

  const onKey = (field, value) => (e) => {
    if (e.key === 'Enter') commit(field, value);
  };

  return (
    <div className="space-y-2.5">
      <div>
        <label className="text-xs text-gray-500 block mb-1">Min salary (₹)</label>
        <input
          type="number"
          min={0}
          placeholder="e.g. 500000"
          value={minVal}
          onChange={(e) => setMinVal(e.target.value)}
          onBlur={(e)    => commit('salary_min', e.target.value)}
          onKeyDown={onKey('salary_min', minVal)}
          className="input-field text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">Max salary (₹)</label>
        <input
          type="number"
          min={0}
          placeholder="e.g. 2000000"
          value={maxVal}
          onChange={(e) => setMaxVal(e.target.value)}
          onBlur={(e)    => commit('salary_max', e.target.value)}
          onKeyDown={onKey('salary_max', maxVal)}
          className="input-field text-sm"
        />
      </div>
    </div>
  );
}

/* ─── Active filter tag ─────────────────────────────────────────── */
function FilterTag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-xs px-3 py-1 rounded-full border border-primary-200">
      {label}
      <button onClick={onRemove} className="hover:text-red-500 ml-0.5 font-bold leading-none">×</button>
    </span>
  );
}

/* ─── Page ──────────────────────────────────────────────────────── */
export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // ── URL-driven state ─────────────────────────────────────────
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

  // ── Debounced keyword (auto-syncs URL as user types) ─────────
  const [inputKeyword,  setInputKeyword]  = useState(keyword);
  const [inputLocation, setInputLocation] = useState(location);
  const debouncedKeyword  = useDebounce(inputKeyword,  500);
  const debouncedLocation = useDebounce(inputLocation, 500);

  // Sync inputs when URL changes externally (back/forward)
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

  // ── Param helpers ────────────────────────────────────────────
  const setParam = useCallback((key, value, replace = false) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else       next.delete(key);
      next.delete('page');
      return next;
    }, { replace });
  }, [setSearchParams]);

  const clearAll = () => setSearchParams({});

  // ── Active filters for tags row ──────────────────────────────
  const activeTags = [
    keyword         && { id: 'keyword',          label: `"${keyword}"`,        clear: () => setParam('keyword', '') },
    location        && { id: 'location',          label: `📍 ${location}`,      clear: () => setParam('location', '') },
    sortBy !== 'date' && { id: 'sort',            label: `Sort: ${sortBy}`,     clear: () => setParam('sort_by', '') },
    categoryId      && { id: 'category_id',       label: 'Category filter',     clear: () => setParam('category_id', '') },
    salaryMinParam  && { id: 'salary_min', label: `Min ${formatSalary(parseInt(salaryMinParam, 10), null)}`, clear: () => setParam('salary_min', '') },
    salaryMaxParam  && { id: 'salary_max', label: `Max ${formatSalary(null, parseInt(salaryMaxParam, 10))}`, clear: () => setParam('salary_max', '') },
    ...jobType.split(',').filter(Boolean).map(t => ({
      id: `jt-${t}`, label: t,
      clear: () => setParam('job_type', toggle(jobType, t)),
    })),
    ...workMode.split(',').filter(Boolean).map(m => ({
      id: `wm-${m}`, label: m,
      clear: () => setParam('work_mode', toggle(workMode, m)),
    })),
    ...experienceLevel.split(',').filter(Boolean).map(l => ({
      id: `el-${l}`, label: `${l} level`,
      clear: () => setParam('experience_level', toggle(experienceLevel, l)),
    })),
  ].filter(Boolean);

  // ── Query ─────────────────────────────────────────────────────
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

  // ── Sidebar ───────────────────────────────────────────────────
  const Sidebar = () => (
    <div className="space-y-6">
      <CheckGroup title="Job Type"       options={JOB_TYPES}  param="job_type"         searchParams={searchParams} setParam={setParam} />
      <div className="border-t border-gray-100" />
      <CheckGroup title="Work Mode"      options={WORK_MODES}  param="work_mode"        searchParams={searchParams} setParam={setParam} />
      <div className="border-t border-gray-100" />
      <CheckGroup title="Experience"     options={EXP_LEVELS}  param="experience_level" searchParams={searchParams} setParam={setParam} />
      <div className="border-t border-gray-100" />

      {/* Salary */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Salary (₹ / year)</h3>
        <SalaryInputs
          minParam={salaryMinParam}
          maxParam={salaryMaxParam}
          onCommit={setParam}
        />
      </div>

      {activeTags.length > 0 && (
        <button onClick={clearAll} className="text-sm text-red-500 hover:underline w-full text-left">
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Top search bar ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Job title, keyword, skill…"
            value={inputKeyword}
            onChange={e => setInputKeyword(e.target.value)}
            className="input-field pl-9 w-full"
          />
        </div>
        <div className="relative sm:w-52">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <input
            type="text"
            placeholder="Location"
            value={inputLocation}
            onChange={e => setInputLocation(e.target.value)}
            className="input-field pl-9 w-full"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setParam('sort_by', e.target.value)}
          className="input-field sm:w-44"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setMobileFiltersOpen(o => !o)}
          className="lg:hidden btn-outline flex items-center gap-2 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2" />
          </svg>
          Filters
          {activeTags.length > 0 && (
            <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeTags.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Active filter tags ───────────────────────────────── */}
      {activeTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {activeTags.map(tag => (
            <FilterTag key={tag.id} label={tag.label} onRemove={tag.clear} />
          ))}
          <button onClick={clearAll} className="text-xs text-red-500 hover:underline self-center">
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* ── Sidebar — desktop ────────────────────────────── */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-6">
            <Sidebar />
          </div>
        </aside>

        {/* ── Mobile sidebar overlay ───────────────────────── */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-gray-900">Filters</h2>
                <button onClick={() => setMobileFiltersOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        {/* ── Results ──────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Results header */}
          <div className="flex items-center justify-between mb-4 min-h-[28px]">
            {isLoading ? (
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            ) : (
              <p className="text-sm text-gray-500">
                {isFetching && !isLoading && (
                  <span className="inline-block w-3 h-3 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mr-2 align-middle" />
                )}
                <strong className="text-gray-800">{pagination?.total ?? 0}</strong> job{pagination?.total !== 1 ? 's' : ''} found
              </p>
            )}
          </div>

          {/* Card list */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 7 }).map((_, i) => <JobCardSkeleton key={i} />)}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-medium text-gray-700 text-lg">No jobs match your filters</p>
              <p className="text-sm text-gray-400 mt-1 mb-5">Try removing some filters or broadening your search.</p>
              <button onClick={clearAll} className="btn-outline text-sm">Clear all filters</button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {jobs.map(job => <JobCard key={job.id} job={job} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-10">
                  <button
                    disabled={page <= 1}
                    onClick={() => setParam('page', page - 1)}
                    className="px-3 py-2 rounded-lg text-sm border border-gray-200 hover:border-primary-400 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ←
                  </button>

                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let p;
                    if (totalPages <= 7) {
                      p = i + 1;
                    } else if (page <= 4) {
                      p = i < 6 ? i + 1 : totalPages;
                    } else if (page >= totalPages - 3) {
                      p = i === 0 ? 1 : totalPages - 6 + i;
                    } else {
                      p = i === 0 ? 1 : i === 6 ? totalPages : page - 3 + i;
                    }
                    const isEllipsis = (i === 1 && p !== 2) || (i === 5 && p !== totalPages - 1);
                    return isEllipsis ? (
                      <span key={`e${i}`} className="px-2 py-2 text-sm text-gray-400">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setParam('page', p === 1 ? '' : p)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          p === page
                            ? 'bg-primary-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-400'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button
                    disabled={page >= totalPages}
                    onClick={() => setParam('page', page + 1)}
                    className="px-3 py-2 rounded-lg text-sm border border-gray-200 hover:border-primary-400 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
