import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employerService } from '../../services/employer.service.js';
import { getAccessToken } from '../../services/api.js';
import { toast } from '../../store/uiStore.js';
import { timeAgo } from '../../utils/helpers.js';

// ─── Authenticated file download (Bearer token is in memory, not cookies) ────
async function triggerResumeDownload(appId, fallbackName = 'resume') {
  const token = getAccessToken();
  const res = await fetch(`/api/employer/applicants/${appId}/resume`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Server returned ${res.status}`);
  const blob = await res.blob();
  const cd   = res.headers.get('content-disposition') ?? '';
  const match = cd.match(/filename="([^"]+)"/);
  const name  = match ? decodeURIComponent(match[1]) : (fallbackName.includes('.') ? fallbackName : `${fallbackName}.pdf`);
  const url   = URL.createObjectURL(blob);
  const a     = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGE_META = {
  applied:     { label: 'Applied',     color: 'bg-blue-100 text-blue-700',    border: 'border-blue-200',   ring: 'ring-blue-200'   },
  screening:   { label: 'Screening',   color: 'bg-indigo-100 text-indigo-700', border: 'border-indigo-200', ring: 'ring-indigo-200' },
  reviewing:   { label: 'Reviewing',   color: 'bg-purple-100 text-purple-700', border: 'border-purple-200', ring: 'ring-purple-200' },
  shortlisted: { label: 'Shortlisted', color: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-200', ring: 'ring-yellow-200' },
  interview:   { label: 'Interview',   color: 'bg-orange-100 text-orange-700', border: 'border-orange-200', ring: 'ring-orange-200' },
  offer:       { label: 'Offer',       color: 'bg-teal-100 text-teal-700',     border: 'border-teal-200',   ring: 'ring-teal-200'   },
  hired:       { label: 'Hired',       color: 'bg-green-100 text-green-700',   border: 'border-green-200',  ring: 'ring-green-200'  },
  rejected:    { label: 'Rejected',    color: 'bg-red-100 text-red-700',       border: 'border-red-200',    ring: 'ring-red-200'    },
};

const PIPELINE = ['applied', 'screening', 'shortlisted', 'interview', 'offer', 'hired'];

const ACTION_BUTTONS = [
  { stage: 'shortlisted', label: 'Shortlist',        style: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
  { stage: 'interview',   label: 'Schedule Interview', style: 'bg-orange-500 hover:bg-orange-600 text-white' },
  { stage: 'offer',       label: 'Send Offer',        style: 'bg-teal-600 hover:bg-teal-700 text-white' },
  { stage: 'hired',       label: 'Hire',              style: 'bg-green-600 hover:bg-green-700 text-white' },
  { stage: 'rejected',    label: 'Reject',            style: 'bg-red-500 hover:bg-red-600 text-white' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 font-medium w-28 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800 flex-1">{value}</span>
    </div>
  );
}

function StagePipeline({ current }) {
  const currentIdx = PIPELINE.indexOf(current);
  const isRejected = current === 'rejected';

  return (
    <div className="space-y-1">
      {PIPELINE.map((stage, idx) => {
        const meta = STAGE_META[stage];
        const isPast    = idx < currentIdx;
        const isCurrent = stage === current;
        const isFuture  = idx > currentIdx;
        return (
          <div key={stage} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors
            ${isCurrent ? `${meta.color} font-semibold ring-1 ${meta.ring}` : ''}
            ${isPast    ? 'text-gray-400'   : ''}
            ${isFuture  ? 'text-gray-300'   : ''}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0
              ${isCurrent ? 'bg-current' : isPast ? 'bg-gray-200' : 'bg-gray-100'}`}
              style={isCurrent ? { backgroundColor: 'currentColor' } : {}}>
              {isPast ? (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-white' : 'bg-gray-300'}`} />
              )}
            </div>
            {meta.label}
          </div>
        );
      })}
      {isRejected && (
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${STAGE_META.rejected.color} ring-1 ring-red-200`}>
          <div className="w-5 h-5 rounded-full bg-red-400 flex items-center justify-center shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          Rejected
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [noteText, setNoteText]       = useState('');
  const [showNoteBox, setShowNoteBox] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [localRating, setLocalRating] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['employer', 'application', id],
    queryFn: () => employerService.getApplication(id),
    enabled: !!id,
  });

  const app    = data?.data?.application ?? null;
  const notes  = data?.data?.notes       ?? [];
  const seeker = app?.seeker ?? {};
  const profile = seeker?.seekerProfile ?? {};

  // Sync local rating from server whenever the query refreshes
  useEffect(() => {
    if (app?.employerRating) setLocalRating(app.employerRating);
  }, [app?.employerRating]);
  const job    = app?.job    ?? {};
  const resume = app?.resume ?? null;

  // Stage mutation
  const stageMutation = useMutation({
    mutationFn: (stage) => employerService.updateStage(id, stage),
    onSuccess: (_, stage) => {
      queryClient.invalidateQueries({ queryKey: ['employer', 'application', id] });
      queryClient.invalidateQueries({ queryKey: ['employer', 'all-applications'] });
      queryClient.invalidateQueries({ queryKey: ['employer', 'app-stats-badge'] });
      toast.success(`Moved to "${STAGE_META[stage]?.label ?? stage}".`);
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? 'Failed to update stage.'),
  });

  // Note mutation
  const noteMutation = useMutation({
    mutationFn: (note) => employerService.addNote(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer', 'application', id] });
      setNoteText('');
      setShowNoteBox(false);
      toast.success('Note added.');
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? 'Failed to add note.'),
  });

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    noteMutation.mutate(noteText.trim());
  };

  const initials = seeker.fullName?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-8 bg-gray-100 rounded-xl w-40 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="text-center py-20">
        <p className="text-base font-bold text-gray-900 mb-2">Application not found</p>
        <Link to="/employer/applications" className="btn-primary text-sm">Back to Applications</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div>
        <Link to="/employer/applications"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-4 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Applications
        </Link>

        <div className="flex items-start gap-4 flex-wrap">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-md">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-extrabold text-gray-900">{seeker.fullName ?? 'Unknown Candidate'}</h1>
              {app.atsStage && (
                <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full ${STAGE_META[app.atsStage]?.color ?? 'bg-gray-100 text-gray-600'}`}>
                  {STAGE_META[app.atsStage]?.label ?? app.atsStage}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{profile.headline ?? seeker.email ?? '—'}</p>
            <p className="text-xs text-gray-400 mt-1">
              Applied for <span className="font-semibold text-gray-700">{job.title ?? '—'}</span>
              {' '}· {timeAgo(app.createdAt)}
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {ACTION_BUTTONS.filter((a) => a.stage !== app.atsStage).map((action) => (
              <button
                key={action.stage}
                onClick={() => stageMutation.mutate(action.stage)}
                disabled={stageMutation.isPending}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50 ${action.style}`}
              >
                {stageMutation.isPending && stageMutation.variables === action.stage ? '…' : action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 columns */}
        <div className="lg:col-span-2 space-y-5">

          {/* Candidate Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Candidate Information
            </h2>
            <InfoRow label="Full Name"   value={seeker.fullName} />
            <InfoRow label="Email"       value={seeker.email} />
            <InfoRow label="Location"    value={profile.location} />
            <InfoRow label="Headline"    value={profile.headline} />
            <InfoRow label="Experience"  value={profile.experienceYears != null ? `${profile.experienceYears} year${profile.experienceYears !== 1 ? 's' : ''}` : null} />
            <InfoRow label="Open to Work" value={profile.openToWork ? 'Yes' : null} />
            {profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0 && (
              <div className="py-2.5 border-b border-gray-50">
                <span className="text-xs text-gray-400 font-medium block mb-2">Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill, i) => (
                    <span key={i} className="bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {typeof skill === 'object' ? skill.name : skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Job Applied For */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Position Applied For
            </h2>
            <InfoRow label="Job Title"   value={job.title} />
            <InfoRow label="Type"        value={job.jobType} />
            <InfoRow label="Work Mode"   value={job.workMode} />
            <InfoRow label="Location"    value={job.location} />
            {(job.salaryMin || job.salaryMax) && (
              <InfoRow label="Salary"
                value={`$${(job.salaryMin ?? 0).toLocaleString()} – $${(job.salaryMax ?? 0).toLocaleString()}`} />
            )}
            <div className="pt-2">
              <Link to={`/employer/jobs/${job.id}/applicants`}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors">
                Open ATS Board for this job
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Resume */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Resume
            </h2>
            {resume ? (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{resume.label || resume.fileName || 'Resume'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{resume.resumeType === 'built' ? 'Builder Resume' : 'Uploaded File'}</p>
                </div>
                <button
                  disabled={downloading}
                  onClick={async () => {
                    setDownloading(true);
                    try {
                      await triggerResumeDownload(app.id, resume?.label || resume?.fileName);
                    } catch {
                      toast.error('Download failed — please try again.');
                    } finally {
                      setDownloading(false);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 px-4 py-2 rounded-xl transition-colors shrink-0"
                >
                  {downloading ? (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12M12 16.5V3" />
                    </svg>
                  )}
                  {downloading ? 'Downloading…' : 'Download'}
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No resume attached to this application.</p>
            )}
          </div>

          {/* Cover Letter */}
          {app.coverLetter && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Cover Letter
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{app.coverLetter}</p>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">

          {/* Pipeline progress */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Application Stage</h3>
            <StagePipeline current={app.atsStage} />
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2 font-medium">Move to stage:</p>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(STAGE_META).filter(([s]) => s !== app.atsStage).map(([s, meta]) => (
                  <button key={s}
                    onClick={() => stageMutation.mutate(s)}
                    disabled={stageMutation.isPending}
                    className={`text-xs font-semibold px-2 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${meta.color} ${meta.border}`}>
                    {meta.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-1">Candidate Rating</h3>
            <p className="text-xs text-gray-400 mb-3">Click to rate this candidate</p>
            <div
              className="flex items-center gap-1"
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = (hoverRating || localRating) >= star;
                return (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onClick={async () => {
                      setLocalRating(star);           // optimistic
                      setHoverRating(0);
                      try {
                        await employerService.setRating(app.id, star);
                        queryClient.invalidateQueries({ queryKey: ['employer', 'application', id] });
                        toast.success('Rating saved.');
                      } catch {
                        setLocalRating(localRating);  // roll back on error
                        toast.error('Failed to save rating.');
                      }
                    }}
                    className="transition-transform hover:scale-125 focus:outline-none"
                  >
                    <svg
                      className={`w-8 h-8 transition-colors duration-100 ${filled ? 'text-amber-400' : 'text-gray-200'}`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                );
              })}
              {localRating > 0 && (
                <span className="ml-2 text-sm font-semibold text-amber-500">{localRating}/5</span>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">Recruiter Notes</h3>
              <button onClick={() => setShowNoteBox(!showNoteBox)}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors">
                + Add Note
              </button>
            </div>

            {showNoteBox && (
              <div className="mb-4 space-y-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Write your note about this candidate…"
                  rows={3}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none placeholder-gray-400"
                />
                <div className="flex gap-2">
                  <button onClick={() => { setShowNoteBox(false); setNoteText(''); }}
                    className="flex-1 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg py-2 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleAddNote} disabled={!noteText.trim() || noteMutation.isPending}
                    className="flex-1 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg py-2 transition-colors disabled:opacity-50">
                    {noteMutation.isPending ? 'Saving…' : 'Save Note'}
                  </button>
                </div>
              </div>
            )}

            {notes.length === 0 ? (
              <p className="text-xs text-gray-400">No notes yet. Add notes to keep track of your observations.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {[...notes].reverse().map((n, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{n.note}</p>
                    <p className="text-[11px] text-gray-400 mt-1.5">{timeAgo(n.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Application meta */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Application Timeline</h3>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Application submitted</p>
                  <p className="text-[11px] text-gray-400">{new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              {app.updatedAt !== app.createdAt && (
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${STAGE_META[app.atsStage]?.color ?? 'bg-gray-100'}`}>
                    <div className="w-2 h-2 rounded-full bg-current" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">
                      Stage updated to "{STAGE_META[app.atsStage]?.label ?? app.atsStage}"
                    </p>
                    <p className="text-[11px] text-gray-400">{timeAgo(app.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
