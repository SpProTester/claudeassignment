import { Link } from 'react-router-dom';
import { jobTypeBadgeColor, workModeBadgeColor, formatSalary, timeAgo } from '../../utils/helpers.js';

function CompanyLogo({ url, name, size = 'md' }) {
  const cls = size === 'sm'
    ? 'w-10 h-10 text-sm rounded-xl'
    : 'w-12 h-12 text-base rounded-2xl';
  return (
    <div className={`${cls} bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 font-bold text-primary-600 overflow-hidden`}>
      {url
        ? <img src={url} alt={name} className="w-full h-full object-contain p-1" />
        : (
          <span className="text-lg font-extrabold text-primary-600">
            {name?.[0]?.toUpperCase() || 'C'}
          </span>
        )
      }
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
  };
}

/* ── Badge colour helpers ────────────────────────────────────────── */
function TypeBadge({ type }) {
  const cls = jobTypeBadgeColor(type);
  return <span className={`badge capitalize ${cls}`}>{type?.replace(/-/g, ' ')}</span>;
}

function ModeBadge({ mode }) {
  const cls = workModeBadgeColor(mode);
  return <span className={`badge capitalize ${cls}`}>{mode}</span>;
}

/* ── Main Card ───────────────────────────────────────────────────── */
export default function JobCard({ job, size = 'md' }) {
  const j = normalise(job);

  return (
    <Link
      to={`/jobs/${j.slug}`}
      className="group block bg-white rounded-2xl border border-gray-100 shadow-card p-5 hover:shadow-card-hover hover:border-primary-200 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <CompanyLogo url={j.logoUrl} name={j.companyName} size={size} />

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors text-sm leading-snug line-clamp-1">
            {j.title}
          </h3>

          {/* Company */}
          {j.companyName && (
            <div className="mt-0.5">
              <span
                className="text-xs text-gray-500 hover:text-primary-600 hover:underline cursor-pointer"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              >
                {j.companyName}
              </span>
            </div>
          )}

          {/* Location */}
          {j.location && (
            <div className="flex items-center gap-1 mt-1.5">
              <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs text-gray-500">{j.location}</span>
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            {j.jobType  && <TypeBadge type={j.jobType} />}
            {j.workMode && <ModeBadge mode={j.workMode} />}
            {(j.salaryMin || j.salaryMax) && (
              <span className="badge bg-green-50 text-green-700">
                {formatSalary(j.salaryMin, j.salaryMax)}
              </span>
            )}
          </div>
        </div>

        {/* Time */}
        <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap pt-0.5">
          {timeAgo(j.createdAt)}
        </span>
      </div>
    </Link>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse shadow-card">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="h-4 bg-gray-200 rounded-lg w-2/3" />
          <div className="h-3 bg-gray-100 rounded-lg w-1/3" />
          <div className="h-3 bg-gray-100 rounded-lg w-1/4" />
          <div className="flex gap-2 mt-1">
            <div className="h-5 bg-gray-200 rounded-full w-16" />
            <div className="h-5 bg-gray-100 rounded-full w-16" />
          </div>
        </div>
        <div className="h-3 w-12 bg-gray-100 rounded-lg shrink-0" />
      </div>
    </div>
  );
}
