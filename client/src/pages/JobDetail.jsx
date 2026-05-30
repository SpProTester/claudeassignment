import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobsService, applicationsService } from '../services/jobs.service.js';
import { seekerService } from '../services/seeker.service.js';
import { useAuth } from '../hooks/useAuth.js';
import { jobTypeBadgeColor, workModeBadgeColor, formatSalary, timeAgo } from '../utils/helpers.js';
import Button from '../components/common/Button.jsx';
import JobCard, { JobCardSkeleton } from '../components/jobs/JobCard.jsx';

/* ─── Share buttons ─────────────────────────────────────────────── */
function ShareButtons({ title }) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;
  const copy = () => {
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-500 font-semibold">Share:</span>
      <button onClick={copy} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-primary-400 hover:text-primary-600 transition-colors font-medium">
        {copied ? '✓ Copied!' : '🔗 Copy link'}
      </button>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer"
        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-colors font-medium">
        LinkedIn
      </a>
      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer"
        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-sky-500 hover:text-sky-600 transition-colors font-medium">
        X / Twitter
      </a>
    </div>
  );
}

/* ─── Skeleton ──────────────────────────────────────────────────── */
function DetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-40 mb-6" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-5">
            <div className="flex gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-7 bg-gray-200 rounded-lg w-3/4" />
                <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-gray-200 rounded-full" />
                  <div className="h-6 w-16 bg-gray-100 rounded-full" />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={`h-3 bg-gray-100 rounded-lg ${i % 3 === 0 ? 'w-full' : i % 3 === 1 ? 'w-5/6' : 'w-4/5'}`} />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div className="h-11 bg-gray-200 rounded-xl" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Apply modal ───────────────────────────────────────────────── */
function ApplyModal({ job, resumes, onClose }) {
  const defaultId = resumes.find(r => r.isDefault)?.id ?? resumes[0]?.id ?? '';
  const [resumeId, setResumeId]       = useState(defaultId);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [done, setDone]               = useState(false);
  const [err, setErr]                 = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setErr('');
    try {
      await applicationsService.apply(job.id, { coverLetter, resumeId });
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
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 text-center animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Application Sent!</h2>
          <p className="text-gray-500 text-sm mb-7">Great work! The employer will review your application and get back to you soon.</p>
          <Button onClick={onClose} className="px-8">Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-slide-up">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Apply for this role</h2>
            <p className="text-sm text-gray-500 mt-0.5">{job.title} · {job.company_name ?? job.employer?.companyName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">✕</button>
        </div>

        {err && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">{err}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Resume selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Resume</label>
            <select
              value={resumeId}
              onChange={e => setResumeId(e.target.value)}
              required
              className="input-field"
            >
              {resumes.map(r => (
                <option key={r.id} value={r.id}>
                  {r.label || r.fileName}{r.isDefault ? ' (default)' : ''}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">
              Manage resumes in{' '}
              <Link to="/seeker/resume" onClick={onClose} className="text-primary-600 hover:underline font-medium">
                your profile
              </Link>
              .
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Cover Letter <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              rows={5}
              className="input-field resize-none"
              placeholder="Briefly introduce yourself and explain why you're a great fit for this role…"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="btn-ghost px-5 py-2.5">Cancel</button>
            <Button type="submit" loading={submitting}>Submit Application</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Info row ───────────────────────────────────────────────────── */
function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <span className="text-lg shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
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

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', slug],
    queryFn:  () => jobsService.getBySlug(slug),
    retry: false,
  });

  const { data: resumeData, isLoading: resumesLoading } = useQuery({
    queryKey: ['my-resumes'],
    queryFn:  () => seekerService.getResumes(),
    enabled:  user?.role === 'seeker',
    staleTime: 2 * 60 * 1000,
  });

  const myResumes = resumeData?.resumes ?? [];
  const hasResume = myResumes.length > 0;

  const { data: similarData, isLoading: simLoading } = useQuery({
    queryKey: ['similar-jobs', job?.workMode, job?.experienceLevel],
    queryFn:  () => jobsService.search({ work_mode: job.workMode, experience_level: job.experienceLevel, limit: '4' }),
    enabled:  !!job,
    staleTime: 5 * 60 * 1000,
  });

  const similarJobs = (similarData?.jobs ?? []).filter(j => j.slug !== slug).slice(0, 3);

  if (isLoading) return <DetailSkeleton />;

  if (error || !job) {
    return (
      <div className="text-center py-28">
        <div className="text-6xl mb-5">😕</div>
        <p className="font-bold text-gray-900 text-2xl mb-2">Job Not Found</p>
        <p className="text-sm text-gray-500 mb-8">This listing may have been closed or removed.</p>
        <Link to="/jobs" className="btn-primary">Browse All Jobs</Link>
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
    <div className="bg-gray-50 min-h-screen">
      {/* Page header band */}
      <div className="bg-white border-b border-gray-100 shadow-sm py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 flex items-center gap-1.5">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <Link to="/jobs" className="hover:text-primary-600 transition-colors">Jobs</Link>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-gray-700 font-medium truncate max-w-[200px]">{job.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Main ──────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Header card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
              <div className="p-7 border-b border-gray-50">
                <div className="flex items-start gap-5">
                  {/* Logo */}
                  <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-3xl font-extrabold text-primary-600 shrink-0 overflow-hidden">
                    {logoUrl
                      ? <img src={logoUrl} alt={companyName} className="w-full h-full object-contain p-1" />
                      : companyName?.[0]?.toUpperCase()
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">{job.title}</h1>
                    {companyName && (
                      <Link to={companySlug ? `/companies/${companySlug}` : '#'}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm mt-1 inline-flex items-center gap-1">
                        {companyName}
                        {isVerified && (
                          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                          </svg>
                        )}
                      </Link>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {job.jobType    && <span className={`badge capitalize ${jobTypeBadgeColor(job.jobType)}`}>{job.jobType?.replace(/-/g, ' ')}</span>}
                      {job.workMode   && <span className={`badge capitalize ${workModeBadgeColor(job.workMode)}`}>{job.workMode}</span>}
                      {job.experienceLevel && <span className="badge bg-gray-100 text-gray-600 capitalize">{job.experienceLevel}</span>}
                      {job.location && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {job.location}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">Posted {timeAgo(job.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {(job.salaryMin || job.salaryMax) && (
                  <div className="mt-5 inline-flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatSalary(job.salaryMin, job.salaryMax)} / year
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="p-7">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Job Description</h2>
                <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </div>
              </div>

              {/* Footer */}
              <div className="px-7 pb-7 pt-2 border-t border-gray-50">
                <ShareButtons title={job.title} />
              </div>
            </div>
          </div>

          {/* ── Sidebar ───────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Apply card — sticky */}
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <h3 className="font-bold text-gray-900 text-base mb-1">Interested in this role?</h3>
                <p className="text-xs text-gray-500 mb-5 flex items-center gap-3">
                  <span>{job.viewsCount ?? 0} views</span>
                  <span>·</span>
                  <span>Posted {timeAgo(job.createdAt)}</span>
                </p>

                {!user && (
                  <>
                    <button
                      onClick={() => navigate('/login')}
                      className="btn-primary w-full justify-center py-3 text-base"
                    >
                      Log In to Apply
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-3">
                      New here?{' '}
                      <Link to="/register" className="text-primary-600 font-semibold hover:underline">Create a free account</Link>
                    </p>
                  </>
                )}

                {user?.role === 'seeker' && (
                  resumesLoading ? (
                    <div className="h-11 bg-gray-100 rounded-xl animate-pulse" />
                  ) : hasResume ? (
                    <button
                      onClick={() => setApplyOpen(true)}
                      className="btn-primary w-full justify-center py-3 text-base"
                    >
                      Apply Now
                    </button>
                  ) : (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 space-y-3">
                      <p className="text-sm font-semibold text-amber-800">Resume required</p>
                      <p className="text-xs text-amber-700 leading-relaxed">
                        Please upload your resume before applying for jobs.
                      </p>
                      <Link
                        to="/seeker/resume"
                        className="btn-primary w-full justify-center py-2.5 text-sm block text-center"
                      >
                        Upload Resume
                      </Link>
                    </div>
                  )
                )}

                {user && user.role !== 'seeker' && (
                  <p className="text-xs text-gray-400 text-center">Log in as a job seeker to apply.</p>
                )}

                {job.expiresAt && (
                  <div className="mt-4 flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-700 px-3 py-2 rounded-xl text-xs font-medium">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Closes {new Date(job.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                )}
              </div>

              {/* Job details */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <h3 className="font-bold text-gray-900 text-base mb-4">Job Overview</h3>
                <InfoRow icon="📍" label="Location"          value={job.location} />
                <InfoRow icon="💼" label="Job Type"          value={job.jobType?.replace(/-/g, ' ')} />
                <InfoRow icon="🖥️" label="Work Mode"         value={job.workMode} />
                <InfoRow icon="📊" label="Experience Level"  value={job.experienceLevel} />
                {(job.salaryMin || job.salaryMax) && (
                  <InfoRow icon="💰" label="Salary" value={formatSalary(job.salaryMin, job.salaryMax) + ' / yr'} />
                )}
              </div>

              {/* Company card */}
              {companyName && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                  <h3 className="font-bold text-gray-900 text-base mb-4">About the Company</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center font-bold text-primary-600 overflow-hidden shrink-0">
                      {logoUrl ? <img src={logoUrl} alt={companyName} className="w-full h-full object-contain" /> : companyName?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{companyName}</p>
                      {isVerified && <p className="text-xs text-blue-600 font-medium">✓ Verified Employer</p>}
                    </div>
                  </div>
                  <InfoRow icon="🏢" label="Industry"      value={industry} />
                  <InfoRow icon="👥" label="Company Size"  value={companySize} />
                  {websiteUrl && (
                    <a href={websiteUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-xs text-primary-600 hover:underline mt-2 font-medium">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      {websiteUrl.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  {companySlug && (
                    <Link to={`/companies/${companySlug}`} className="btn-outline text-xs w-full text-center block mt-4">
                      View Company Profile
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Similar jobs ──────────────────────────────────────── */}
        {(simLoading || similarJobs.length > 0) && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Similar Opportunities</h2>
            {simLoading ? (
              <div className="grid sm:grid-cols-3 gap-5">
                {Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid sm:grid-cols-3 gap-5">
                {similarJobs.map(j => <JobCard key={j.id} job={j} size="sm" />)}
              </div>
            )}
          </section>
        )}
      </div>

      {applyOpen && <ApplyModal job={job} resumes={myResumes} onClose={() => setApplyOpen(false)} />}
    </div>
  );
}
