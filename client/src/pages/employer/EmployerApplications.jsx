import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employerService } from '../../services/employer.service.js';
import { timeAgo } from '../../utils/helpers.js';
import { toast } from '../../store/uiStore.js';

/* ─── Constants ──────────────────────────────────────────────────── */
const STAGES = ['applied','screening','reviewing','shortlisted','interview','offer','hired','rejected'];

const STAGE_META = {
  applied:     { label: 'Applied',      bg: 'bg-gray-100',    text: 'text-gray-700',    dot: 'bg-gray-400'    },
  screening:   { label: 'Screening',    bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-500'    },
  reviewing:   { label: 'Reviewing',    bg: 'bg-indigo-100',  text: 'text-indigo-700',  dot: 'bg-indigo-500'  },
  shortlisted: { label: 'Shortlisted',  bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  interview:   { label: 'Interview',    bg: 'bg-purple-100',  text: 'text-purple-700',  dot: 'bg-purple-500'  },
  offer:       { label: 'Offer',        bg: 'bg-cyan-100',    text: 'text-cyan-700',    dot: 'bg-cyan-500'    },
  hired:       { label: 'Hired',        bg: 'bg-green-100',   text: 'text-green-700',   dot: 'bg-green-500'   },
  rejected:    { label: 'Rejected',     bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500'     },
};

const SUMMARY_CARDS = [
  { key: 'total',       label: 'Total',          icon: '📋', bg: 'bg-primary-50',  text: 'text-primary-700',  val: (s) => s.total },
  { key: 'applied',     label: 'New',            icon: '🆕', bg: 'bg-gray-50',     text: 'text-gray-800',     val: (s) => s.applied },
  { key: 'reviewing',   label: 'Under Review',   icon: '🔍', bg: 'bg-indigo-50',   text: 'text-indigo-700',   val: (s) => (s.reviewing || 0) + (s.screening || 0) },
  { key: 'shortlisted', label: 'Shortlisted',    icon: '⭐', bg: 'bg-amber-50',    text: 'text-amber-700',    val: (s) => s.shortlisted },
  { key: 'interview',   label: 'Interview',      icon: '🗓️', bg: 'bg-purple-50',   text: 'text-purple-700',   val: (s) => s.interview },
  { key: 'hired',       label: 'Hired',          icon: '🎉', bg: 'bg-green-50',    text: 'text-green-700',    val: (s) => s.hired },
  { key: 'rejected',    label: 'Rejected',       icon: '❌', bg: 'bg-red-50',      text: 'text-red-700',      val: (s) => s.rejected },
];

const ATS_ACTIONS = [
  { label: 'Move to Review',       stage: 'reviewing',   cls: 'text-indigo-600 hover:bg-indigo-50' },
  { label: 'Shortlist',            stage: 'shortlisted', cls: 'text-amber-600  hover:bg-amber-50'  },
  { label: 'Schedule Interview',   stage: 'interview',   cls: 'text-purple-600 hover:bg-purple-50' },
  { label: 'Extend Offer',         stage: 'offer',       cls: 'text-cyan-600   hover:bg-cyan-50'   },
  { label: 'Hire',                 stage: 'hired',       cls: 'text-green-600  hover:bg-green-50'  },
  { label: 'Reject',               stage: 'rejected',    cls: 'text-red-600    hover:bg-red-50'    },
];

/* ─── Stage badge ─────────────────────────────────────────────────── */
function StageBadge({ stage }) {
  const m = STAGE_META[stage] ?? STAGE_META.applied;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${m.bg} ${m.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

/* ─── Candidate detail drawer ─────────────────────────────────────── */
function CandidateDrawer({ app, onClose, onStageChange }) {
  const qc = useQueryClient();
  const [note, setNote]       = useState('');
  const [noteOpen, setNoteOpen] = useState(false);
  const [rating, setRating]   = useState(app.employerRating ?? 0);

  const stageMut = useMutation({
    mutationFn: (stage) => employerService.updateStage(app.id, stage),
    onSuccess: (_, stage) => {
      toast.success(`Moved to ${STAGE_META[stage]?.label}`);
      onStageChange(app.id, stage);
      qc.invalidateQueries({ queryKey: ['employer', 'applications'] });
      qc.invalidateQueries({ queryKey: ['employer', 'app-summary'] });
    },
    onError: (e) => toast.error(e.message),
  });

  const noteMut = useMutation({
    mutationFn: (n) => employerService.addNote(app.id, n),
    onSuccess: () => { toast.success('Note added'); setNote(''); setNoteOpen(false); },
    onError:   (e) => toast.error(e.message),
  });

  const ratingMut = useMutation({
    mutationFn: (r) => employerService.setRating(app.id, r),
    onSuccess: () => toast.success('Rating saved'),
    onError:   (e) => toast.error(e.message),
  });

  const seeker  = app.seeker ?? {};
  const profile = seeker.seekerProfile ?? {};
  const job     = app.job ?? {};

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white shadow-2xl overflow-y-auto flex flex-col animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-base">
              {seeker.fullName?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{seeker.fullName ?? 'Unknown'}</p>
              <p className="text-xs text-gray-500">{seeker.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-6 space-y-6">
          {/* Current stage + job */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Current Stage</span>
              <StageBadge stage={app.atsStage ?? 'applied'} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Applied For</span>
              <Link to={`/employer/jobs/${job.id}/review-publish`} className="text-xs font-semibold text-primary-600 hover:underline truncate max-w-[160px]">
                {job.title}
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Applied</span>
              <span className="text-xs text-gray-600">{timeAgo(app.createdAt)}</span>
            </div>
          </div>

          {/* ATS action buttons */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Move to Stage</p>
            <div className="grid grid-cols-2 gap-2">
              {ATS_ACTIONS.map(({ label, stage, cls }) => (
                <button
                  key={stage}
                  onClick={() => stageMut.mutate(stage)}
                  disabled={stageMut.isPending || (app.atsStage ?? 'applied') === stage}
                  className={`px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${cls}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Profile info */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Candidate Profile</p>
            {profile.headline && (
              <p className="text-sm font-medium text-gray-800">{profile.headline}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              {profile.location && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {profile.location}
                </div>
              )}
              {profile.experienceYears != null && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  {profile.experienceYears} yr{profile.experienceYears !== 1 ? 's' : ''} exp
                </div>
              )}
            </div>
          </div>

          {/* Cover letter */}
          {app.coverLetter && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Cover Letter</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 whitespace-pre-wrap line-clamp-6">
                {app.coverLetter}
              </p>
            </div>
          )}

          {/* Resume download */}
          {app.resume && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Resume</p>
              <a
                href={employerService.resumeUrl(app.id)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 truncate">
                    {app.resume.label || app.resume.fileName || 'Resume'}
                  </p>
                  <p className="text-xs text-gray-400">Click to download / preview</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </a>
            </div>
          )}

          {/* Rating */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Your Rating</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => { setRating(star); ratingMut.mutate(star); }}
                  className="transition-transform hover:scale-110"
                >
                  <svg
                    className={`w-6 h-6 ${star <= rating ? 'text-amber-400' : 'text-gray-200'}`}
                    fill="currentColor" viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              {rating > 0 && (
                <button onClick={() => { setRating(0); ratingMut.mutate(0); }} className="ml-2 text-xs text-gray-400 hover:text-gray-600">
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Employer notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Private Notes</p>
              <button
                onClick={() => setNoteOpen((o) => !o)}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700"
              >
                {noteOpen ? 'Cancel' : '+ Add Note'}
              </button>
            </div>
            {noteOpen && (
              <div className="space-y-2">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Add a private note about this candidate…"
                  className="input-field resize-none text-sm"
                />
                <button
                  onClick={() => note.trim() && noteMut.mutate(note.trim())}
                  disabled={noteMut.isPending || !note.trim()}
                  className="btn-primary text-xs py-1.5 w-full"
                >
                  {noteMut.isPending ? 'Saving…' : 'Save Note'}
                </button>
              </div>
            )}
            {(() => {
              let notes = [];
              try { notes = app.employerNotes ? JSON.parse(app.employerNotes) : []; } catch { notes = []; }
              return notes.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {[...notes].reverse().slice(0, 3).map((n, i) => (
                    <div key={i} className="bg-amber-50 rounded-lg px-3 py-2.5 text-xs">
                      <p className="text-gray-700 leading-relaxed">{n.note}</p>
                      <p className="text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  ))}
                </div>
              ) : null;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────────── */
export default function EmployerApplications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();

  // Filters from URL
  const [search,   setSearch]   = useState(searchParams.get('search')   ?? '');
  const [jobId,    setJobId]    = useState(searchParams.get('jobId')    ?? '');
  const [stage,    setStage]    = useState(searchParams.get('atsStage') ?? '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') ?? '');
  const [dateTo,   setDateTo]   = useState(searchParams.get('dateTo')   ?? '');
  const [page,     setPage]     = useState(1);
  const [selected, setSelected] = useState(null); // candidate drawer

  // Sync filters → URL
  useEffect(() => {
    const p = {};
    if (search)   p.search   = search;
    if (jobId)    p.jobId    = jobId;
    if (stage)    p.atsStage = stage;
    if (dateFrom) p.dateFrom = dateFrom;
    if (dateTo)   p.dateTo   = dateTo;
    setSearchParams(p, { replace: true });
    setPage(1);
  }, [search, jobId, stage, dateFrom, dateTo]); // eslint-disable-line

  // Summary
  const { data: summaryData, isLoading: sumLoading } = useQuery({
    queryKey: ['employer', 'app-summary'],
    queryFn:  () => employerService.getApplicationsSummary(),
    staleTime: 30 * 1000,
  });
  const summary = summaryData?.data?.summary ?? {};

  // Jobs list for filter dropdown
  const { data: jobsData } = useQuery({
    queryKey: ['employer', 'jobs', ''],
    queryFn:  () => employerService.listJobs({ limit: 100 }),
    staleTime: 2 * 60 * 1000,
  });
  const allJobs = jobsData?.data?.jobs ?? [];

  // Applications list
  const params = { page, limit: 20 };
  if (search)   params.search   = search;
  if (jobId)    params.jobId    = jobId;
  if (stage)    params.atsStage = stage;
  if (dateFrom) params.dateFrom = dateFrom;
  if (dateTo)   params.dateTo   = dateTo;

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['employer', 'applications', params],
    queryFn:  () => employerService.listApplications(params),
    staleTime: 30 * 1000,
    keepPreviousData: true,
  });

  const applications = appsData?.data?.applications ?? [];
  const pagination   = appsData?.data?.pagination   ?? {};

  // Optimistic stage update in table
  const handleStageChange = (appId, newStage) => {
    setSelected((prev) => prev?.id === appId ? { ...prev, atsStage: newStage } : prev);
  };

  const stageMutInline = useMutation({
    mutationFn: ({ id, stage: s }) => employerService.updateStage(id, s),
    onSuccess: (_, { stage: s }) => {
      toast.success(`Moved to ${STAGE_META[s]?.label}`);
      qc.invalidateQueries({ queryKey: ['employer', 'applications'] });
      qc.invalidateQueries({ queryKey: ['employer', 'app-summary'] });
    },
    onError: (e) => toast.error(e.message),
  });

  const clearFilters = () => { setSearch(''); setJobId(''); setStage(''); setDateFrom(''); setDateTo(''); };
  const hasFilters   = search || jobId || stage || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all candidates across every job in one place</p>
        </div>
        <Link to="/employer/jobs/new" className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Post New Job
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {SUMMARY_CARDS.map(({ key, label, icon, bg, text, val }) => {
          const count = val(summary);
          const isActive = (key === 'reviewing' && stage === 'reviewing') || stage === key;
          return (
            <button
              key={key}
              onClick={() => setStage((s) => s === key ? '' : key === 'reviewing' ? 'reviewing' : key)}
              className={`${bg} rounded-2xl p-4 text-left transition-all hover:scale-105 hover:shadow-md ${isActive ? 'ring-2 ring-primary-500' : ''}`}
            >
              <span className="text-xl">{icon}</span>
              <p className={`text-2xl font-extrabold mt-1 ${text}`}>
                {sumLoading ? '—' : count}
              </p>
              <p className={`text-xs font-semibold mt-0.5 ${text} opacity-80`}>{label}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search candidate name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 text-sm"
            />
          </div>

          {/* Job filter */}
          <select
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="input-field text-sm min-w-[180px] appearance-none"
          >
            <option value="">All Jobs</option>
            {allJobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>

          {/* Stage filter */}
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="input-field text-sm min-w-[150px] appearance-none"
          >
            <option value="">All Stages</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>{STAGE_META[s]?.label}</option>
            ))}
          </select>

          {/* Date range */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="input-field text-sm w-36"
            title="From date"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="input-field text-sm w-36"
            title="To date"
          />

          {hasFilters && (
            <button onClick={clearFilters} className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Applications table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        {appsLoading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-6 py-4 animate-pulse flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-100 rounded w-36" />
                  <div className="h-3 bg-gray-100 rounded w-24" />
                </div>
                <div className="h-5 bg-gray-100 rounded-full w-20" />
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📭</p>
            <p className="font-bold text-gray-900 text-base mb-1">
              {hasFilters ? 'No applications match your filters' : 'No applications yet'}
            </p>
            <p className="text-sm text-gray-500 mb-5">
              {hasFilters
                ? 'Try adjusting or clearing your filters.'
                : 'Applications will appear here once candidates apply to your jobs.'}
            </p>
            {!hasFilters && (
              <Link to="/employer/jobs" className="btn-primary text-sm">
                View Job Listings
              </Link>
            )}
            {hasFilters && (
              <button onClick={clearFilters} className="btn-outline text-sm">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Candidate</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Applied For</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Experience</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Applied</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Stage</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {applications.map((app) => {
                    const seeker  = app.seeker ?? {};
                    const profile = seeker.seekerProfile ?? {};
                    const job     = app.job ?? {};
                    return (
                      <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                        {/* Candidate */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs shrink-0">
                              {seeker.fullName?.[0]?.toUpperCase() ?? '?'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 truncate max-w-[140px]">{seeker.fullName}</p>
                              <p className="text-xs text-gray-400 truncate max-w-[140px]">{seeker.email}</p>
                            </div>
                          </div>
                        </td>
                        {/* Job */}
                        <td className="px-4 py-4">
                          <Link to={`/employer/jobs/${job.id}/review-publish`}
                            className="text-sm font-medium text-primary-600 hover:underline truncate block max-w-[160px]">
                            {job.title}
                          </Link>
                          {job.workMode && <p className="text-xs text-gray-400 capitalize">{job.workMode}</p>}
                        </td>
                        {/* Experience */}
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-700">
                            {profile.experienceYears != null ? `${profile.experienceYears} yr${profile.experienceYears !== 1 ? 's' : ''}` : '—'}
                          </p>
                          {profile.headline && <p className="text-xs text-gray-400 truncate max-w-[120px]">{profile.headline}</p>}
                        </td>
                        {/* Location */}
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-600">{profile.location || '—'}</p>
                        </td>
                        {/* Date */}
                        <td className="px-4 py-4 text-xs text-gray-400 whitespace-nowrap">
                          {timeAgo(app.createdAt)}
                        </td>
                        {/* Stage */}
                        <td className="px-4 py-4">
                          <StageBadge stage={app.atsStage ?? 'applied'} />
                        </td>
                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelected(app)}
                              className="p-1.5 rounded-md text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                              title="View candidate"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </button>
                            {app.resume && (
                              <a
                                href={employerService.resumeUrl(app.id)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Download resume"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                              </a>
                            )}
                            {/* Quick stage selector */}
                            <select
                              value={app.atsStage ?? 'applied'}
                              onChange={(e) => stageMutInline.mutate({ id: app.id, stage: e.target.value })}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white hover:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
                              title="Change stage"
                            >
                              {STAGES.map((s) => (
                                <option key={s} value={s}>{STAGE_META[s]?.label}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {applications.map((app) => {
                const seeker  = app.seeker ?? {};
                const profile = seeker.seekerProfile ?? {};
                const job     = app.job ?? {};
                return (
                  <div key={app.id} className="px-4 py-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs shrink-0">
                          {seeker.fullName?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{seeker.fullName}</p>
                          <p className="text-xs text-gray-400 truncate">{job.title}</p>
                        </div>
                      </div>
                      <StageBadge stage={app.atsStage ?? 'applied'} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                      <span>{timeAgo(app.createdAt)}</span>
                      <button onClick={() => setSelected(app)} className="text-primary-600 font-semibold">
                        View Profile
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  {((page - 1) * pagination.limit) + 1}–{Math.min(page * pagination.limit, pagination.total)} of {pagination.total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:border-primary-400 disabled:opacity-40 transition-colors"
                  >
                    ← Prev
                  </button>
                  <span className="text-xs text-gray-500">Page {page} of {pagination.pages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:border-primary-400 disabled:opacity-40 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Candidate detail drawer */}
      {selected && (
        <CandidateDrawer
          app={selected}
          onClose={() => setSelected(null)}
          onStageChange={handleStageChange}
        />
      )}
    </div>
  );
}
