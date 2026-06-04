import { useState, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employerService } from '../../services/employer.service.js';
import { getAccessToken } from '../../services/api.js';
import { toast } from '../../store/uiStore.js';
import { timeAgo } from '../../utils/helpers.js';

// ─── Authenticated file download (Bearer token lives in memory, not cookies) ─
async function triggerResumeDownload(appId, fallbackName = 'resume') {
  const token = getAccessToken();
  const res = await fetch(`/api/employer/applicants/${appId}/resume`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Server returned ${res.status}`);
  const blob  = await res.blob();
  const cd    = res.headers.get('content-disposition') ?? '';
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
  applied:     { label: 'Applied',     color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
  screening:   { label: 'Screening',   color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  reviewing:   { label: 'Reviewing',   color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  shortlisted: { label: 'Shortlisted', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  interview:   { label: 'Interview',   color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  offer:       { label: 'Offer',       color: 'bg-teal-100 text-teal-700',     dot: 'bg-teal-500' },
  hired:       { label: 'Hired',       color: 'bg-green-100 text-green-700',   dot: 'bg-green-500' },
  rejected:    { label: 'Rejected',    color: 'bg-red-100 text-red-700',       dot: 'bg-red-500' },
};

const STAGES = Object.keys(STAGE_META);

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, color, icon, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all duration-200 w-full
        ${active
          ? 'border-primary-400 bg-primary-50 shadow-md shadow-primary-100'
          : 'border-gray-200 bg-white hover:border-primary-200 hover:shadow-md'
        }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xl font-black text-gray-900 leading-tight">{value ?? '—'}</p>
        <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
      </div>
    </button>
  );
}

// ─── Stage Badge ──────────────────────────────────────────────────────────────

function StageBadge({ stage }) {
  const meta = STAGE_META[stage] ?? { label: stage, color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${meta.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

// ─── Quick Stage Changer ──────────────────────────────────────────────────────

function StageChanger({ appId, current, onStageChange, isChanging }) {
  const [open, setOpen] = useState(false);
  const nextStages = STAGES.filter((s) => s !== current);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={isChanging}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-200 rounded-lg px-2 py-1 transition-colors disabled:opacity-50"
      >
        {isChanging ? (
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
          </svg>
        )}
        Stage
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-36 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden">
            {nextStages.map((s) => {
              const meta = STAGE_META[s];
              return (
                <button key={s} onClick={() => { onStageChange(appId, s); setOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                  <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Application Row ──────────────────────────────────────────────────────────

function ApplicationRow({ app, selected, onSelect, onStageChange, isChangingStage }) {
  const seeker = app.seeker ?? {};
  const profile = seeker.seekerProfile ?? {};
  const job = app.job ?? {};
  const resume = app.resume;
  const initials = seeker.fullName?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';

  return (
    <tr className="hover:bg-gray-50/60 transition-colors group">
      {/* Checkbox */}
      <td className="pl-5 pr-3 py-3.5">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(app.id)}
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
        />
      </td>
      {/* Candidate */}
      <td className="px-3 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <Link to={`/employer/applications/${app.id}`}
              className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors truncate block leading-tight">
              {seeker.fullName ?? 'Unknown'}
            </Link>
            <p className="text-xs text-gray-400 truncate mt-0.5">{profile.headline ?? seeker.email ?? '—'}</p>
          </div>
        </div>
      </td>
      {/* Applied Job */}
      <td className="px-3 py-3.5 min-w-0">
        <p className="text-sm text-gray-800 font-medium truncate max-w-[160px]">{job.title ?? '—'}</p>
        <p className="text-xs text-gray-400 mt-0.5">{job.jobType ?? ''} {job.workMode ? `· ${job.workMode}` : ''}</p>
      </td>
      {/* Experience */}
      <td className="px-3 py-3.5 whitespace-nowrap">
        <span className="text-sm text-gray-700">
          {profile.experienceYears != null ? `${profile.experienceYears} yr${profile.experienceYears !== 1 ? 's' : ''}` : '—'}
        </span>
      </td>
      {/* Location */}
      <td className="px-3 py-3.5 max-w-[120px]">
        <span className="text-sm text-gray-600 truncate block">{profile.location ?? job.location ?? '—'}</span>
      </td>
      {/* Resume */}
      <td className="px-3 py-3.5">
        {resume ? (
          <button
            onClick={() => triggerResumeDownload(app.id, resume.label || resume.fileName).catch(() => toast.error('Download failed.'))}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg px-2.5 py-1 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12M12 16.5V3" />
            </svg>
            Resume
          </button>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>
      {/* Applied Date */}
      <td className="px-3 py-3.5 whitespace-nowrap">
        <span className="text-xs text-gray-500">{timeAgo(app.createdAt)}</span>
      </td>
      {/* Status */}
      <td className="px-3 py-3.5">
        <StageBadge stage={app.atsStage} />
      </td>
      {/* Actions */}
      <td className="pl-3 pr-5 py-3.5">
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link to={`/employer/applications/${app.id}`}
            className="text-xs font-semibold text-gray-600 hover:text-primary-600 bg-white hover:bg-primary-50 border border-gray-200 hover:border-primary-200 rounded-lg px-2.5 py-1 transition-colors whitespace-nowrap">
            View
          </Link>
          <StageChanger appId={app.id} current={app.atsStage} onStageChange={onStageChange} isChanging={isChangingStage(app.id)} />
          {resume && (
            <button
              title="Download Resume"
              onClick={() => triggerResumeDownload(app.id, resume.label || resume.fileName).catch(() => toast.error('Download failed.'))}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 border border-gray-200 hover:border-primary-200 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12M12 16.5V3" />
              </svg>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Mobile Application Card ──────────────────────────────────────────────────

function ApplicationCard({ app, onStageChange, isChangingStage }) {
  const seeker = app.seeker ?? {};
  const profile = seeker.seekerProfile ?? {};
  const job = app.job ?? {};
  const resume = app.resume;
  const initials = seeker.fullName?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link to={`/employer/applications/${app.id}`}
                className="text-sm font-bold text-gray-900 hover:text-primary-600 truncate block">
                {seeker.fullName ?? 'Unknown'}
              </Link>
              <p className="text-xs text-gray-400 truncate">{profile.headline ?? seeker.email ?? '—'}</p>
            </div>
            <StageBadge stage={app.atsStage} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-400">Job</span>
          <p className="text-gray-700 font-medium truncate">{job.title ?? '—'}</p>
        </div>
        <div>
          <span className="text-gray-400">Applied</span>
          <p className="text-gray-700 font-medium">{timeAgo(app.createdAt)}</p>
        </div>
        {profile.location && (
          <div>
            <span className="text-gray-400">Location</span>
            <p className="text-gray-700 font-medium truncate">{profile.location}</p>
          </div>
        )}
        {profile.experienceYears != null && (
          <div>
            <span className="text-gray-400">Experience</span>
            <p className="text-gray-700 font-medium">{profile.experienceYears} yrs</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        <Link to={`/employer/applications/${app.id}`}
          className="flex-1 text-xs font-semibold text-center text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg py-2 transition-colors">
          View Details
        </Link>
        <StageChanger appId={app.id} current={app.atsStage} onStageChange={onStageChange} isChanging={isChangingStage(app.id)} />
        {resume && (
          <button
            onClick={() => triggerResumeDownload(app.id, resume.label || resume.fileName).catch(() => toast.error('Download failed.'))}
            className="text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 transition-colors"
          >
            Resume
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EmployerApplications() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch]   = useState('');
  const [jobId, setJobId]     = useState(searchParams.get('jobId') ?? '');
  const [stage, setStage]     = useState(searchParams.get('stage') ?? '');
  const [sortBy, setSortBy]   = useState('createdAt');
  const [sortOrder]           = useState('DESC');
  const [page, setPage]       = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkStage, setBulkStage] = useState('');
  const [changingId, setChangingId] = useState(null);

  const LIMIT = 25;

  // Build stable query params
  const queryParams = useMemo(() => ({
    ...(search && { search }),
    ...(jobId  && { jobId }),
    ...(stage  && { atsStage: stage }),
    sortBy, sortOrder,
    page, limit: LIMIT,
  }), [search, jobId, stage, sortBy, sortOrder, page]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['employer', 'all-applications', queryParams],
    queryFn: () => employerService.listAllApplications(queryParams),
    keepPreviousData: true,
  });

  const { data: jobsData } = useQuery({
    queryKey: ['employer', 'jobs'],
    queryFn: () => employerService.listJobs({ limit: 100 }),
  });

  const applications = data?.data?.applications ?? [];
  const pagination   = data?.data?.pagination   ?? { total: 0, pages: 1 };
  const stats        = data?.data?.stats        ?? {};
  const jobs         = jobsData?.data?.jobs     ?? [];

  // Stage mutation
  const stageMutation = useMutation({
    mutationFn: ({ id, newStage }) => employerService.updateStage(id, newStage),
    onMutate: ({ id }) => setChangingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer', 'all-applications'] });
      queryClient.invalidateQueries({ queryKey: ['employer', 'app-stats-badge'] });
      toast.success('Stage updated.');
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? 'Failed to update stage.'),
    onSettled: () => setChangingId(null),
  });

  const handleStageChange = useCallback((id, newStage) => {
    stageMutation.mutate({ id, newStage });
  }, [stageMutation]);

  const isChangingStage = useCallback((id) => changingId === id && stageMutation.isPending, [changingId, stageMutation.isPending]);

  // Selection helpers
  const toggleSelect    = (id) => setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleSelectAll = () => {
    if (selectedIds.size === applications.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(applications.map((a) => a.id)));
  };
  const clearSelection  = () => setSelectedIds(new Set());

  // Bulk stage change
  const handleBulkStage = async () => {
    if (!bulkStage || selectedIds.size === 0) return;
    const ids = [...selectedIds];
    for (const id of ids) {
      await employerService.updateStage(id, bulkStage).catch(() => null);
    }
    queryClient.invalidateQueries({ queryKey: ['employer', 'all-applications'] });
    queryClient.invalidateQueries({ queryKey: ['employer', 'app-stats-badge'] });
    clearSelection();
    setBulkStage('');
    toast.success(`Updated ${ids.length} application${ids.length > 1 ? 's' : ''}.`);
  };

  // Stat card click filters
  const statFilters = {
    '': () => setStage(''),
    applied:     () => setStage('applied'),
    shortlisted: () => setStage('shortlisted'),
    interview:   () => setStage('interview'),
    rejected:    () => setStage('rejected'),
    hired:       () => setStage('hired'),
  };

  const handleStatClick = (key) => { statFilters[key]?.(); setPage(1); };

  return (
    <div className="space-y-6 pb-8">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Job Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Centralized ATS — review, filter, and move candidates through your hiring pipeline
          </p>
        </div>
        <Link to="/employer/jobs/new" className="btn-primary flex items-center gap-2 shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Post a Job
        </Link>
      </div>

      {/* ── Stats Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Total" value={stats.total}
          color="bg-primary-100 text-primary-600"
          active={stage === ''}
          onClick={() => handleStatClick('')}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
        />
        <StatCard
          label="New" value={stats.applied}
          color="bg-blue-100 text-blue-600"
          active={stage === 'applied'}
          onClick={() => handleStatClick('applied')}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>}
        />
        <StatCard
          label="Shortlisted" value={stats.shortlisted}
          color="bg-yellow-100 text-yellow-600"
          active={stage === 'shortlisted'}
          onClick={() => handleStatClick('shortlisted')}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>}
        />
        <StatCard
          label="Interview" value={stats.interview}
          color="bg-orange-100 text-orange-600"
          active={stage === 'interview'}
          onClick={() => handleStatClick('interview')}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
        />
        <StatCard
          label="Rejected" value={stats.rejected}
          color="bg-red-100 text-red-600"
          active={stage === 'rejected'}
          onClick={() => handleStatClick('rejected')}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Hired" value={stats.hired}
          color="bg-green-100 text-green-600"
          active={stage === 'hired'}
          onClick={() => handleStatClick('hired')}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Candidate search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search candidate…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 bg-gray-50"
            />
          </div>

          {/* Job filter */}
          <select value={jobId} onChange={(e) => { setJobId(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 bg-gray-50 cursor-pointer">
            <option value="">All Job Listings</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>

          {/* Status filter */}
          <select value={stage} onChange={(e) => { setStage(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 bg-gray-50 cursor-pointer">
            <option value="">All Statuses</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>{STAGE_META[s].label}</option>
            ))}
          </select>

          {/* Sort */}
          <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 bg-gray-50 cursor-pointer">
            <option value="createdAt">Newest First</option>
            <option value="updatedAt">Recently Updated</option>
            <option value="atsStage">By Stage</option>
          </select>
        </div>

        {/* Active filters summary */}
        {(search || jobId || stage) && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs text-gray-500">Filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 text-xs bg-primary-100 text-primary-700 font-medium px-2.5 py-1 rounded-full">
                Candidate: {search}
                <button onClick={() => { setSearch(''); setPage(1); }} className="ml-0.5 hover:text-primary-900">✕</button>
              </span>
            )}
            {jobId && (
              <span className="inline-flex items-center gap-1 text-xs bg-primary-100 text-primary-700 font-medium px-2.5 py-1 rounded-full">
                Job: {jobs.find(j => j.id === jobId)?.title ?? jobId}
                <button onClick={() => { setJobId(''); setPage(1); }} className="ml-0.5 hover:text-primary-900">✕</button>
              </span>
            )}
            {stage && (
              <span className="inline-flex items-center gap-1 text-xs bg-primary-100 text-primary-700 font-medium px-2.5 py-1 rounded-full">
                Stage: {STAGE_META[stage]?.label}
                <button onClick={() => { setStage(''); setPage(1); }} className="ml-0.5 hover:text-primary-900">✕</button>
              </span>
            )}
            <button onClick={() => { setSearch(''); setJobId(''); setStage(''); setPage(1); }}
              className="text-xs text-gray-500 hover:text-red-500 underline">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Bulk Action Bar ───────────────────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="bg-primary-600 text-white rounded-2xl px-5 py-3 flex items-center gap-4 flex-wrap shadow-lg shadow-primary-200">
          <span className="text-sm font-semibold">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2 flex-1">
            <select value={bulkStage} onChange={(e) => setBulkStage(e.target.value)}
              className="text-sm bg-white/15 border border-white/30 text-white rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer">
              <option value="">Move to stage…</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>{STAGE_META[s].label}</option>
              ))}
            </select>
            <button onClick={handleBulkStage} disabled={!bulkStage}
              className="text-sm font-semibold bg-white text-primary-700 hover:bg-primary-50 px-4 py-1.5 rounded-lg disabled:opacity-40 transition-colors">
              Apply
            </button>
          </div>
          <button onClick={clearSelection} className="text-sm text-white/70 hover:text-white transition-colors">
            Cancel
          </button>
        </div>
      )}

      {/* ── Desktop Table ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hidden md:block">
        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          <p className="text-sm font-semibold text-gray-700">
            {isFetching ? 'Loading…' : `${pagination.total ?? 0} application${pagination.total !== 1 ? 's' : ''}`}
          </p>
        </div>

        {isLoading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="w-4 h-4 bg-gray-100 rounded" />
                <div className="w-9 h-9 bg-gray-100 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-gray-100 rounded w-36" />
                  <div className="h-3 bg-gray-100 rounded w-24" />
                </div>
                <div className="h-3.5 bg-gray-100 rounded w-28" />
                <div className="h-5 bg-gray-100 rounded-full w-20" />
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <p className="text-base font-bold text-gray-900 mb-1">No applications found</p>
            <p className="text-sm text-gray-500">
              {search || jobId || stage ? 'Try adjusting your filters.' : 'Applications will appear here once candidates apply to your jobs.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/30">
                  <th className="pl-5 pr-3 py-3 text-left">
                    <input type="checkbox"
                      checked={selectedIds.size === applications.length && applications.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Candidate</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Applied For</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Experience</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Resume</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Applied</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="pl-3 pr-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {applications.map((app) => (
                  <ApplicationRow
                    key={app.id}
                    app={app}
                    selected={selectedIds.has(app.id)}
                    onSelect={toggleSelect}
                    onStageChange={handleStageChange}
                    isChangingStage={isChangingStage}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Mobile Cards ──────────────────────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 h-36 animate-pulse" />
          ))
        ) : applications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <p className="text-sm font-semibold text-gray-700">No applications found</p>
          </div>
        ) : (
          applications.map((app) => (
            <ApplicationCard key={app.id} app={app} onStageChange={handleStageChange} isChangingStage={isChangingStage} />
          ))
        )}
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between gap-4 bg-white rounded-2xl border border-gray-200 px-5 py-3">
          <p className="text-sm text-gray-500">
            Page <span className="font-semibold text-gray-700">{page}</span> of{' '}
            <span className="font-semibold text-gray-700">{pagination.pages}</span>
            {' '}· {pagination.total} total
          </p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page - 2 + i;
              if (p < 1 || p > pagination.pages) return null;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors
                    ${p === page ? 'bg-primary-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
