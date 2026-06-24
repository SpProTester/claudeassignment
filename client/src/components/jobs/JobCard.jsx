import { Link } from 'react-router-dom';
import { formatSalary, timeAgo } from '../../utils/helpers.js';

const TYPE_STYLE = {
  'full-time':  { bg: 'bg-violet-50 text-violet-700 ring-violet-200',  dot: 'bg-violet-500' },
  'part-time':  { bg: 'bg-blue-50 text-blue-700 ring-blue-200',        dot: 'bg-blue-500' },
  'contract':   { bg: 'bg-orange-50 text-orange-700 ring-orange-200',  dot: 'bg-orange-500' },
  'freelance':  { bg: 'bg-amber-50 text-amber-700 ring-amber-200',     dot: 'bg-amber-500' },
  'internship': { bg: 'bg-pink-50 text-pink-700 ring-pink-200',        dot: 'bg-pink-500' },
};

const MODE_STYLE = {
  onsite: { bg: 'bg-slate-50 text-slate-700 ring-slate-200',     icon: '🏢' },
  remote: { bg: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: '🌐' },
  hybrid: { bg: 'bg-cyan-50 text-cyan-700 ring-cyan-200',        icon: '🔀' },
};

function CompanyLogo({ url, name }) {
  return (
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
      {url ? (
        <img src={url} alt={name} className="w-full h-full object-contain p-1.5" />
      ) : (
        <span className="text-xl font-extrabold text-primary-600">
          {name?.[0]?.toUpperCase() || 'C'}
        </span>
      )}
    </div>
  );
}

function normalise(job) {
  const employer = job.employer ?? {};
  return {
    slug:            job.slug,
    title:           job.title,
    jobType:         job.jobType         ?? job.job_type,
    workMode:        job.workMode        ?? job.work_mode,
    experienceLevel: job.experienceLevel ?? job.experience_level,
    location:        job.location,
    salaryMin:       job.salaryMin       ?? job.salary_min,
    salaryMax:       job.salaryMax       ?? job.salary_max,
    createdAt:       job.createdAt       ?? job.created_at,
    companyName:     employer.companyName ?? job.company_name,
    companySlug:     employer.companySlug ?? job.company_slug,
    logoUrl:         employer.logoUrl     ?? job.logo_url,
    industry:        employer.industry    ?? job.industry,
    isVerified:      employer.isVerified  ?? job.employer_verified,
  };
}

export default function JobCard({ job }) {
  const j = normalise(job);
  const typeStyle = TYPE_STYLE[j.jobType];
  const modeStyle = MODE_STYLE[j.workMode];

  return (
    <Link
      to={`/jobs/${j.slug}`}
      className="group block bg-white rounded-2xl border border-gray-100 shadow-card p-5 hover:shadow-card-hover hover:border-primary-200 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <CompanyLogo url={j.logoUrl} name={j.companyName} />

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors text-[15px] leading-snug line-clamp-1">
                {j.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                {j.companyName && (
                  <span className="text-sm text-gray-500 font-medium">{j.companyName}</span>
                )}
                {j.isVerified && (
                  <svg className="w-4 h-4 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-.497 3.91 3.745 3.745 0 01-3.91.497A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.91-.497 3.745 3.745 0 01-.497-3.91A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 01.497-3.91 3.746 3.746 0 013.91-.497A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.91.497 3.746 3.746 0 01.497 3.91A3.745 3.745 0 0121 12z" />
                  </svg>
                )}
              </div>
            </div>

            <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full font-medium">
              {timeAgo(j.createdAt)}
            </span>
          </div>

          {/* Location + Salary */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5">
            {j.location && (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {j.location}
              </span>
            )}
            {(j.salaryMin || j.salaryMax) && (
              <span className="flex items-center gap-1 text-sm font-semibold text-green-700">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatSalary(j.salaryMin, j.salaryMax)}
              </span>
            )}
          </div>

          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            {typeStyle && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ${typeStyle.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${typeStyle.dot}`} />
                {j.jobType.replace(/-/g, ' ')}
              </span>
            )}
            {modeStyle && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ${modeStyle.bg}`}>
                <span>{modeStyle.icon}</span>
                {j.workMode}
              </span>
            )}
            {j.experienceLevel && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 ring-1 ring-gray-200 capitalize">
                {j.experienceLevel} level
              </span>
            )}
            {j.industry && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-600 ring-1 ring-primary-200 capitalize">
                {j.industry}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {j.companyName && (
            <span className="text-xs text-gray-400">{j.companyName}</span>
          )}
        </div>
        <span className="text-xs font-semibold text-primary-600 group-hover:text-primary-700 flex items-center gap-1 transition-colors">
          View Details
          <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse shadow-card">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1">
              <div className="h-4 bg-gray-200 rounded-lg w-2/3" />
              <div className="h-3.5 bg-gray-100 rounded-lg w-1/3" />
            </div>
            <div className="h-6 bg-gray-100 rounded-full w-16 shrink-0" />
          </div>
          <div className="h-3.5 bg-gray-100 rounded-lg w-1/2" />
          <div className="flex gap-2 mt-1">
            <div className="h-5 bg-gray-200 rounded-full w-20" />
            <div className="h-5 bg-gray-100 rounded-full w-16" />
            <div className="h-5 bg-gray-100 rounded-full w-20" />
          </div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="h-3 bg-gray-100 rounded w-28" />
        <div className="h-3 bg-gray-100 rounded w-20" />
      </div>
    </div>
  );
}
