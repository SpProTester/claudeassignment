import { Link } from 'react-router-dom';
import { jobTypeBadgeColor, workModeBadgeColor, formatSalary, timeAgo } from '../../utils/helpers.js';

function CompanyLogo({ url, name, size = 'md' }) {
  const cls = size === 'sm'
    ? 'w-9 h-9 text-sm'
    : 'w-12 h-12 text-base';
  return (
    <div className={`${cls} rounded-xl bg-gray-100 flex items-center justify-center shrink-0 font-bold text-gray-400 overflow-hidden border border-gray-200`}>
      {url
        ? <img src={url} alt={name} className="w-full h-full object-cover" />
        : (name?.[0]?.toUpperCase() || 'C')
      }
    </div>
  );
}

/**
 * Normalises both camelCase (Sequelize) and snake_case (raw SQL) job shapes.
 */
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
  };
}

export default function JobCard({ job, size = 'md' }) {
  const j = normalise(job);

  return (
    <Link
      to={`/jobs/${j.slug}`}
      className="card block group hover:border-primary-300 hover:shadow-md transition-all duration-150"
    >
      <div className="flex items-start gap-4">
        <CompanyLogo url={j.logoUrl} name={j.companyName} size={size} />

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
            {j.title}
          </h3>

          {j.companyName && (
            <span
              onClick={e => e.preventDefault()}
              className="inline-block"
            >
              <Link
                to={j.companySlug ? `/companies/${j.companySlug}` : '#'}
                className="text-sm text-gray-500 hover:text-primary-600 hover:underline"
                onClick={e => e.stopPropagation()}
              >
                {j.companyName}
              </Link>
            </span>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {j.jobType && (
              <span className={`badge capitalize ${jobTypeBadgeColor(j.jobType)}`}>
                {j.jobType}
              </span>
            )}
            {j.workMode && (
              <span className={`badge capitalize ${workModeBadgeColor(j.workMode)}`}>
                {j.workMode}
              </span>
            )}
            {j.location && (
              <span className="text-xs text-gray-500 flex items-center gap-0.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {j.location}
              </span>
            )}
            {(j.salaryMin || j.salaryMax) && (
              <span className="text-xs font-medium text-green-700">
                {formatSalary(j.salaryMin, j.salaryMax)}
              </span>
            )}
          </div>
        </div>

        <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
          {timeAgo(j.createdAt)}
        </span>
      </div>
    </Link>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
          <div className="flex gap-2">
            <div className="h-5 bg-gray-200 rounded-full w-16" />
            <div className="h-5 bg-gray-100 rounded-full w-16" />
            <div className="h-5 bg-gray-100 rounded-full w-20" />
          </div>
        </div>
        <div className="h-3 w-12 bg-gray-100 rounded" />
      </div>
    </div>
  );
}
