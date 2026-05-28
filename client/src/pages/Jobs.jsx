import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { jobsService } from '../services/jobs.service.js';
import { jobTypeBadgeColor, formatSalary, timeAgo } from '../utils/helpers.js';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'remote', 'internship'];
const EXP_LEVELS = ['entry', 'mid', 'senior', 'lead', 'executive'];

function JobCard({ job }) {
  return (
    <Link to={`/jobs/${job.id}`} className="card block group">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-lg font-bold text-gray-400 overflow-hidden">
          {job.company?.logoUrl ? (
            <img src={job.company.logoUrl} alt={job.company.name} className="w-full h-full object-cover" />
          ) : (
            (job.company?.name?.[0] || 'J')
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
            {job.title}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">{job.company?.name}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            <span className={`badge ${jobTypeBadgeColor(job.jobType)} capitalize`}>
              {job.jobType}
            </span>
            {job.location && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                📍 {job.location}
              </span>
            )}
            {(job.salaryMin || job.salaryMax) && (
              <span className="text-xs text-gray-500">
                {formatSalary(job.salaryMin, job.salaryMax)}
              </span>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-400 shrink-0">{timeAgo(job.createdAt)}</span>
      </div>
    </Link>
  );
}

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = searchParams.get('search') || '';
  const location = searchParams.get('location') || '';
  const jobType = searchParams.get('jobType') || '';
  const experienceLevel = searchParams.get('experienceLevel') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLoading(true);
    jobsService
      .getAll({ search, location, jobType, experienceLevel, page, limit: 10 })
      .then((data) => {
        setJobs(data.jobs);
        setPagination(data.pagination);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, location, jobType, experienceLevel, page]);

  const setFilter = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete('page');
      return next;
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilter('search', localSearch);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search jobs..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="input-field flex-1 max-w-sm"
        />
        <button type="submit" className="btn-primary">Search</button>
      </form>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar */}
        <aside className="w-full lg:w-56 shrink-0 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Job Type
            </h3>
            <div className="space-y-1">
              {JOB_TYPES.map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="jobType"
                    checked={jobType === t}
                    onChange={() => setFilter('jobType', jobType === t ? '' : t)}
                    className="accent-primary-600"
                  />
                  <span className="text-sm capitalize text-gray-700 group-hover:text-primary-600">
                    {t}
                  </span>
                </label>
              ))}
              {jobType && (
                <button
                  onClick={() => setFilter('jobType', '')}
                  className="text-xs text-red-500 mt-1 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Experience
            </h3>
            <div className="space-y-1">
              {EXP_LEVELS.map((l) => (
                <label key={l} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="experienceLevel"
                    checked={experienceLevel === l}
                    onChange={() => setFilter('experienceLevel', experienceLevel === l ? '' : l)}
                    className="accent-primary-600"
                  />
                  <span className="text-sm capitalize text-gray-700 group-hover:text-primary-600">
                    {l}
                  </span>
                </label>
              ))}
              {experienceLevel && (
                <button
                  onClick={() => setFilter('experienceLevel', '')}
                  className="text-xs text-red-500 mt-1 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="card animate-pulse h-24 bg-gray-100" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-600">{error}</div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-3xl mb-3">🔍</p>
              <p className="text-gray-600 font-medium">No jobs found.</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                {pagination?.total} job{pagination?.total !== 1 ? 's' : ''} found
              </p>
              <div className="space-y-3">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setFilter('page', p === 1 ? '' : p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-primary-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
