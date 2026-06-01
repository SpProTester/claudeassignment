import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employerService } from '../../services/employer.service.js';
import { jobStatusColor, jobStatusLabel, jobTypeBadgeColor, workModeBadgeColor, formatSalary, timeAgo } from '../../utils/helpers.js';
import { toast } from '../../store/uiStore.js';

/* ─── Section wrapper ─────────────────────────────────────────────── */
function Section({ title, children, editStep }) {
  const { id } = useParams();
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <h2 className="font-bold text-gray-900">{title}</h2>
        {editStep && (
          <Link
            to={`/employer/jobs/${id}/edit`}
            state={{ startStep: editStep }}
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
            Edit
          </Link>
        )}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

/* ─── Detail row ──────────────────────────────────────────────────── */
function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-36 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800 capitalize">{value}</span>
    </div>
  );
}

/* ─── Status action button map ────────────────────────────────────── */
const STATUS_ACTIONS = {
  draft:   { label: 'Publish Now',  next: 'active',  cls: 'btn-primary' },
  active:  { label: 'Pause Job',    next: 'paused',  cls: 'btn-outline' },
  paused:  { label: 'Resume Job',   next: 'active',  cls: 'btn-primary' },
  closed:  { label: 'Reopen as Draft', next: 'draft', cls: 'btn-outline' },
  expired: null,
};

/* ─── Page ────────────────────────────────────────────────────────── */
export default function JobReviewPublish() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [renewDate, setRenewDate] = useState('');
  const [showRenew, setShowRenew] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['employer', 'job', id],
    queryFn: () => employerService.getJob(id),
  });

  const statusMutation = useMutation({
    mutationFn: ({ status, extra }) => employerService.changeStatus(id, status, extra),
    onSuccess: (_, { label }) => {
      toast.success(`Job ${label ?? 'updated'}.`);
      qc.invalidateQueries({ queryKey: ['employer', 'job', id] });
      qc.invalidateQueries({ queryKey: ['employer', 'jobs'] });
      qc.invalidateQueries({ queryKey: ['employer', 'job-stats'] });
      setShowRenew(false);
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 h-40" />
        ))}
      </div>
    );
  }

  if (error || !data?.data?.job) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-4xl mb-4">😕</p>
        <p className="font-bold text-gray-900 mb-2">Job not found</p>
        <Link to="/employer/jobs" className="btn-primary text-sm">Back to Listings</Link>
      </div>
    );
  }

  const job = data.data.job;
  const company = job.employer;
  const action = STATUS_ACTIONS[job.status] ?? null;

  const minRenewDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/employer/jobs" className="text-xs text-gray-400 hover:text-primary-600 transition-colors">
              ← Job Listings
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`badge ${jobStatusColor(job.status)}`}>{jobStatusLabel(job.status)}</span>
            <span className="text-xs text-gray-400">Posted {timeAgo(job.createdAt)}</span>
            {job.viewsCount > 0 && (
              <span className="text-xs text-gray-400">· {job.viewsCount} views</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={`/employer/jobs/${id}/edit`}
            className="btn-outline flex items-center gap-1.5 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
            Edit Job
          </Link>
          <Link
            to={`/employer/applications?jobId=${id}`}
            className="btn-outline flex items-center gap-1.5 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            View Applicants
            {parseInt(job.applicationsCount, 10) > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                {parseInt(job.applicationsCount, 10)}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Publish status card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <h2 className="font-bold text-gray-900 mb-4">Publishing Status</h2>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {['draft', 'active', 'paused', 'closed'].map((s) => (
            <div key={s} className={`p-4 rounded-xl border-2 transition-colors ${
              job.status === s
                ? s === 'active'
                  ? 'border-green-400 bg-green-50'
                  : s === 'paused'
                  ? 'border-amber-400 bg-amber-50'
                  : s === 'closed'
                  ? 'border-gray-400 bg-gray-50'
                  : 'border-primary-400 bg-primary-50'
                : 'border-gray-100 bg-gray-50 opacity-50'
            }`}>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-0.5">{s}</p>
              <p className="text-xs text-gray-500 leading-snug">
                {s === 'draft'   && 'Saved, not visible to candidates'}
                {s === 'active'  && 'Live — candidates can search & apply'}
                {s === 'paused'  && 'Hidden temporarily, not accepting applications'}
                {s === 'closed'  && 'Hiring completed, removed from listings'}
              </p>
            </div>
          ))}
        </div>

        {job.status === 'expired' && (
          <div className="mb-4 p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-sm">
            This job expired on{' '}
            <strong>{new Date(job.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>.
            Set a new expiry date to republish it.
          </div>
        )}

        <div className="flex items-center gap-3">
          {job.status === 'expired' ? (
            showRenew ? (
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="date"
                  min={minRenewDate}
                  value={renewDate}
                  onChange={(e) => setRenewDate(e.target.value)}
                  className="input-field py-1.5 text-sm w-40"
                />
                <button
                  onClick={() => renewDate && statusMutation.mutate({ status: 'active', extra: { expiresAt: renewDate }, label: 'renewed and published' })}
                  disabled={statusMutation.isPending || !renewDate}
                  className="btn-primary text-sm py-1.5"
                >
                  {statusMutation.isPending ? 'Renewing…' : 'Renew & Publish'}
                </button>
                <button onClick={() => setShowRenew(false)} className="text-sm text-gray-500 hover:text-gray-700">
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setShowRenew(true)} className="btn-primary text-sm">
                Renew Job
              </button>
            )
          ) : action ? (
            <button
              onClick={() => statusMutation.mutate({ status: action.next, label: action.label.toLowerCase() })}
              disabled={statusMutation.isPending}
              className={`${action.cls} text-sm`}
            >
              {statusMutation.isPending ? 'Updating…' : action.label}
            </button>
          ) : null}

          {job.expiresAt && job.status !== 'expired' && (
            <span className="text-xs text-gray-400">
              Expires {new Date(job.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      {/* Basic info */}
      <Section title="Basic Information" editStep={0}>
        <DetailRow label="Job Title"        value={job.title} />
        <DetailRow label="Job Type"         value={job.jobType?.replace(/-/g, ' ')} />
        <DetailRow label="Work Mode"        value={job.workMode} />
        <DetailRow label="Experience Level" value={job.experienceLevel} />
        <DetailRow label="Location"         value={job.location} />
        {(job.salaryMin || job.salaryMax) && (
          <DetailRow label="Salary" value={`${formatSalary(job.salaryMin, job.salaryMax)} / yr`} />
        )}
      </Section>

      {/* Description */}
      <Section title="Job Description" editStep={1}>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
      </Section>

      {/* Requirements */}
      {job.requirements && (
        <Section title="Requirements" editStep={1}>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
        </Section>
      )}

      {/* Benefits */}
      {job.benefits && (
        <Section title="Benefits & Perks" editStep={1}>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{job.benefits}</p>
        </Section>
      )}

      {/* Skills */}
      <Section title="Required Skills" editStep={2}>
        {job.skills?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {job.skills.map((s) => (
              <span key={s.id} className="badge bg-primary-50 text-primary-700 text-xs px-3 py-1">
                {s.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No skills added yet.</p>
        )}
      </Section>

      {/* Company info */}
      {company && (
        <Section title="Company Information">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl font-bold text-primary-600 shrink-0 overflow-hidden">
              {company.logoUrl
                ? <img src={company.logoUrl} alt={company.companyName} className="w-full h-full object-contain p-1" />
                : company.companyName?.[0]?.toUpperCase()
              }
            </div>
            <div>
              <p className="font-bold text-gray-900">{company.companyName}</p>
              {company.industry && <p className="text-xs text-gray-500 mt-0.5 capitalize">{company.industry}</p>}
              {company.websiteUrl && (
                <a href={company.websiteUrl} target="_blank" rel="noreferrer"
                  className="text-xs text-primary-600 hover:underline mt-0.5 block">
                  {company.websiteUrl}
                </a>
              )}
            </div>
          </div>
          {company.isVerified && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              Verified Company
            </span>
          )}
        </Section>
      )}

      {/* Meta */}
      <div className="text-xs text-gray-400 text-center pb-4">
        Job ID: {id} · Created {timeAgo(job.createdAt)} · Last updated {timeAgo(job.updatedAt)}
      </div>
    </div>
  );
}
