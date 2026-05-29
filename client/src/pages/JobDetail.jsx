import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobsService, applicationsService } from '../services/jobs.service.js';
import { useAuth } from '../hooks/useAuth.js';
import { jobTypeBadgeColor, workModeBadgeColor, formatSalary, timeAgo } from '../utils/helpers.js';
import Button from '../components/common/Button.jsx';
import JobCard, { JobCardSkeleton } from '../components/jobs/JobCard.jsx';

/* ─── Share buttons ─────────────────────────────────────────────── */
function ShareButtons({ title }) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;

  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-500 font-medium">Share:</span>
      <button
        onClick={copy}
        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-primary-400 hover:text-primary-600 transition-colors"
      >
        {copied ? '✓ Copied' : '🔗 Copy link'}
      </button>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank" rel="noreferrer"
        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-colors"
      >
        LinkedIn
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank" rel="noreferrer"
        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-sky-500 hover:text-sky-600 transition-colors"
      >
        X / Twitter
      </a>
    </div>
  );
}

/* ─── Skeleton ──────────────────────────────────────────────────── */
function DetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24 mb-6" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-7 space-y-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-gray-200 rounded-full" />
                  <div className="h-5 w-16 bg-gray-100 rounded-full" />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-7 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-3 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="h-10 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Apply modal ───────────────────────────────────────────────── */
function ApplyModal({ job, onClose }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [done, setDone]               = useState(false);
  const [err, setErr]                 = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErr('');
    try {
      await applicationsService.apply(job.id, { coverLetter });
      setDone(true);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-500 text-sm mb-6">Good luck! We'll notify you of any updates.</p>
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-7">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Apply for {job.title}</h2>
        <p className="text-sm text-gray-500 mb-5">{job.company_name ?? job.employer?.companyName}</p>

        {err && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Letter <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              rows={5}
              className="input-field resize-none"
              placeholder="Briefly introduce yourself and why you're a great fit…"
            />
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={submitting}>Submit Application</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────── */
export default function JobDetail() {
  const { slug }    = useParams();
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [applyOpen, setApplyOpen] = useState(false);

  // ── Fetch job ────────────────────────────────────────────────
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', slug],
    queryFn:  () => jobsService.getBySlug(slug),
    retry: false,
  });

  // ── Similar jobs ─────────────────────────────────────────────
  const { data: similarData, isLoading: simLoading } = useQuery({
    queryKey:  ['similar-jobs', job?.workMode, job?.experienceLevel],
    queryFn:   () => jobsService.search({
      work_mode:        job.workMode,
      experience_level: job.experienceLevel,
      limit: '4',
    }),
    enabled: !!job,
    staleTime: 5 * 60 * 1000,
  });

  const similarJobs = (similarData?.jobs ?? []).filter(j => j.slug !== slug).slice(0, 3);

  if (isLoading) return <DetailSkeleton />;

  if (error || !job) {
    return (
      <div className="text-center py-24">
        <p className="text-5xl mb-4">😕</p>
        <p className="text-gray-600 font-medium text-lg mb-2">Job not found</p>
        <p className="text-sm text-gray-400 mb-6">This listing may have been closed or removed.</p>
        <Link to="/jobs" className="btn-primary inline-block">Browse all jobs</Link>
      </div>
    );
  }

  const companyName = job.employer?.companyName ?? job.company_name;
  const companySlug = job.employer?.companySlug ?? job.company_slug;
  const logoUrl     = job.employer?.logoUrl     ?? job.logo_url;
  const websiteUrl  = job.employer?.websiteUrl  ?? job.website_url;
  const industry    = job.employer?.industry    ?? job.industry;
  const companySize = job.employer?.companySize ?? job.company_size;
  const isVerified  = job.employer?.isVerified  ?? job.employer_verified;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span>›</span>
        <Link to="/jobs" className="hover:text-primary-600">Jobs</Link>
        <span>›</span>
        <span className="text-gray-800 truncate max-w-[200px]">{job.title}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Main content ───────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Header card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
            <div className="p-7 border-b border-gray-100">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-400 shrink-0 overflow-hidden">
                  {logoUrl
                    ? <img src={logoUrl} alt={companyName} className="w-full h-full object-cover" />
                    : companyName?.[0]?.toUpperCase()
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">{job.title}</h1>
                  {companyName && (
                    <Link
                      to={companySlug ? `/companies/${companySlug}` : '#'}
                      className="text-gray-500 hover:text-primary-600 text-sm mt-0.5 inline-block"
                    >
                      {companyName}
                      {isVerified && <span className="ml-1.5 text-blue-500" title="Verified employer">✓</span>}
                    </Link>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className={`badge capitalize ${jobTypeBadgeColor(job.jobType)}`}>{job.jobType}</span>
                    <span className={`badge capitalize ${workModeBadgeColor(job.workMode)}`}>{job.workMode}</span>
                    <span className="badge bg-gray-100 text-gray-700 capitalize">{job.experienceLevel}</span>
                    {job.location && (
                      <span className="text-xs text-gray-500 flex items-center gap-0.5">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {job.location}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">Posted {timeAgo(job.createdAt)}</span>
                  </div>
                </div>
              </div>

              {(job.salaryMin || job.salaryMax) && (
                <p className="mt-5 text-sm font-semibold text-green-700 bg-green-50 border border-green-100 inline-block px-4 py-1.5 rounded-full">
                  💰 {formatSalary(job.salaryMin, job.salaryMax)} / year
                </p>
              )}
            </div>

            {/* Description */}
            <div className="p-7 space-y-6">
              <section>
                <h2 className="text-base font-semibold text-gray-800 mb-3">Job Description</h2>
                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </div>
              </section>
            </div>

            {/* Share */}
            <div className="px-7 pb-7">
              <ShareButtons title={job.title} />
            </div>
          </div>
        </div>

        {/* ── Sidebar ────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Apply card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Ready to apply?</h3>
            <p className="text-xs text-gray-500 mb-4">
              {job.viewsCount} view{job.viewsCount !== 1 ? 's' : ''} · Posted {timeAgo(job.createdAt)}
            </p>
            {user?.role === 'seeker' || !user ? (
              <Button
                className="w-full justify-center"
                onClick={() => user ? setApplyOpen(true) : navigate('/login?redirect=' + encodeURIComponent(location.pathname))}
              >
                {user ? 'Apply Now' : 'Login to Apply'}
              </Button>
            ) : (
              <p className="text-xs text-gray-400 text-center">Log in as a job seeker to apply.</p>
            )}

            {job.expiresAt && (
              <p className="text-xs text-orange-600 mt-3 text-center">
                ⏳ Closes {new Date(job.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>

          {/* Company card */}
          {companyName && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-gray-400 overflow-hidden shrink-0">
                  {logoUrl
                    ? <img src={logoUrl} alt={companyName} className="w-full h-full object-cover" />
                    : companyName?.[0]
                  }
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{companyName}</p>
                  {isVerified && <p className="text-xs text-blue-500">✓ Verified employer</p>}
                </div>
              </div>

              {industry    && <p className="text-xs text-gray-600">🏢 {industry}</p>}
              {companySize && <p className="text-xs text-gray-600">👥 {companySize} employees</p>}
              {websiteUrl  && (
                <a href={websiteUrl} target="_blank" rel="noreferrer"
                  className="text-xs text-primary-600 hover:underline block truncate">
                  🌐 {websiteUrl.replace(/^https?:\/\//, '')}
                </a>
              )}

              {companySlug && (
                <Link to={`/companies/${companySlug}`} className="btn-outline text-xs w-full text-center block mt-2">
                  View Company Profile
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Similar jobs ────────────────────────────────────── */}
      {(simLoading || similarJobs.length > 0) && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Similar Opportunities</h2>
          {simLoading ? (
            <div className="grid sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 gap-4">
              {similarJobs.map(j => <JobCard key={j.id} job={j} size="sm" />)}
            </div>
          )}
        </section>
      )}

      {/* Apply modal */}
      {applyOpen && <ApplyModal job={job} onClose={() => setApplyOpen(false)} />}
    </div>
  );
}
