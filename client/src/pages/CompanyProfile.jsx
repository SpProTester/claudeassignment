import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api.js';
import { jobsService } from '../services/jobs.service.js';
import JobCard, { JobCardSkeleton } from '../components/jobs/JobCard.jsx';

/* ─── Skeleton ──────────────────────────────────────────────────── */
function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-44 bg-gray-200 rounded-2xl mb-6" />
      <div className="max-w-5xl mx-auto px-4 grid lg:grid-cols-3 gap-8">
        <div className="space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-2/3" />
        </div>
        <div className="lg:col-span-2 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/4 mb-4" />
          {Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────── */
export default function CompanyProfile() {
  const { slug } = useParams();

  const { data: companyData, isLoading: compLoading, error: compError } = useQuery({
    queryKey: ['company', slug],
    queryFn:  () => api.get(`/companies/slug/${slug}`),
    retry: false,
  });

  const company = companyData?.company;

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey:  ['company-jobs', slug],
    queryFn:   () => jobsService.search({ company_slug: slug, limit: '20' }),
    enabled:   !!company,
    staleTime: 2 * 60 * 1000,
  });

  const jobs = jobsData?.jobs ?? [];

  if (compLoading) return <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10"><ProfileSkeleton /></div>;

  if (compError || !company) {
    return (
      <div className="text-center py-24">
        <p className="text-5xl mb-4">🏢</p>
        <p className="text-gray-600 font-medium text-lg mb-2">Company not found</p>
        <p className="text-sm text-gray-400 mb-6">This company profile doesn't exist or has been removed.</p>
        <Link to="/jobs" className="btn-primary inline-block">Browse jobs</Link>
      </div>
    );
  }

  const INDUSTRY_COLORS = {
    Technology: 'from-blue-600 to-indigo-700',
    Finance:    'from-emerald-600 to-teal-700',
    Healthcare: 'from-red-500 to-pink-600',
    Education:  'from-purple-600 to-violet-700',
    Marketing:  'from-orange-500 to-amber-600',
  };
  const bannerGradient = INDUSTRY_COLORS[company.industry] ?? 'from-primary-600 to-blue-700';

  return (
    <div>
      {/* ── Banner ────────────────────────────────────────────── */}
      <div className={`bg-gradient-to-br ${bannerGradient} text-white`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center overflow-hidden border-2 border-white/30 shrink-0">
              {company.logoUrl
                ? <img src={company.logoUrl} alt={company.companyName} className="w-full h-full object-contain" />
                : <span className="text-3xl font-bold text-white">{company.companyName?.[0]}</span>
              }
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{company.companyName}</h1>
                {company.isVerified && (
                  <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full border border-white/30">
                    ✓ Verified
                  </span>
                )}
              </div>
              {company.industry && (
                <p className="text-white/80 mt-1">{company.industry}</p>
              )}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-white/70">
                {company.companySize && <span>👥 {company.companySize} employees</span>}
                {jobs.length > 0       && <span>💼 {jobs.length} open position{jobs.length !== 1 ? 's' : ''}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Left: company info ───────────────────────────── */}
          <aside className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">About</h2>

              <dl className="space-y-3 text-sm">
                {company.industry && (
                  <div>
                    <dt className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Industry</dt>
                    <dd className="text-gray-800">{company.industry}</dd>
                  </div>
                )}
                {company.companySize && (
                  <div>
                    <dt className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Company size</dt>
                    <dd className="text-gray-800">{company.companySize} employees</dd>
                  </div>
                )}
                {company.websiteUrl && (
                  <div>
                    <dt className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Website</dt>
                    <dd>
                      <a
                        href={company.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary-600 hover:underline truncate block"
                      >
                        {company.websiteUrl.replace(/^https?:\/\//, '')}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <Link to="/jobs" className="btn-outline text-sm w-full text-center block">
              ← All jobs
            </Link>
          </aside>

          {/* ── Right: open positions ────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">
                Open Positions
                {!jobsLoading && (
                  <span className="ml-2 text-sm font-normal text-gray-500">({jobs.length})</span>
                )}
              </h2>
            </div>

            {jobsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <JobCardSkeleton key={i} />)}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <p className="text-3xl mb-3">📋</p>
                <p className="text-gray-600 font-medium">No open positions right now</p>
                <p className="text-sm text-gray-400 mt-1">Check back soon or browse other companies.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map(job => <JobCard key={job.id} job={job} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
