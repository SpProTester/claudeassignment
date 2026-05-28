import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  closestCenter,
} from '@dnd-kit/core';
import { employerService } from '../../services/employer.service.js';
import { toast } from '../../store/uiStore.js';
import { atsStageColor, timeAgo } from '../../utils/helpers.js';

// ── Stage config ──────────────────────────────────────────────────────────────
const STAGES = [
  { id: 'applied',     label: 'Applied',     color: 'bg-blue-500'   },
  { id: 'reviewing',   label: 'Reviewing',   color: 'bg-yellow-500' },
  { id: 'shortlisted', label: 'Shortlisted', color: 'bg-indigo-500' },
  { id: 'interview',   label: 'Interview',   color: 'bg-purple-500' },
  { id: 'offer',       label: 'Offer',       color: 'bg-teal-500'   },
  { id: 'hired',       label: 'Hired',       color: 'bg-green-500'  },
  { id: 'rejected',    label: 'Rejected',    color: 'bg-red-500'    },
];

// ── Star rating helper ────────────────────────────────────────────────────────
function Stars({ rating }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
          viewBox="0 0 24 24" stroke="none"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

// ── Applicant card (shared between board and drag overlay) ────────────────────
function ApplicantCardContent({ app, onRatingClick, onNoteClick, onEmailClick }) {
  const initials = app.seeker?.fullName
    ?.split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm select-none">
      {/* Header */}
      <div className="flex items-start gap-2.5 mb-2">
        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
            {app.seeker?.fullName ?? 'Unknown'}
          </p>
          <p className="text-xs text-gray-400 truncate">{app.seeker?.seekerProfile?.headline ?? app.seeker?.email}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
        <span>{timeAgo(app.createdAt)}</span>
        <Stars rating={app.employerRating} />
      </div>

      {/* Seeker profile tags */}
      {app.seeker?.seekerProfile?.experienceYears > 0 && (
        <p className="text-xs text-gray-500 mb-2">
          {app.seeker.seekerProfile.experienceYears}y exp
          {app.seeker.seekerProfile.location ? ` · ${app.seeker.seekerProfile.location}` : ''}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 mt-2 border-t border-gray-100 pt-2">
        {app.resumeId && (
          <a
            href={employerService.resumeUrl(app.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-xs text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            title="Download resume"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            CV
          </a>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onNoteClick?.(app); }}
          className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-xs text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
          title="Add note"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          Note
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onRatingClick?.(app); }}
          className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-xs text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
          title="Set rating"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          Rate
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEmailClick?.(app); }}
          className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Send email"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          Email
        </button>
      </div>
    </div>
  );
}

// ── Draggable card wrapper ────────────────────────────────────────────────────
function DraggableCard({ app, onRatingClick, onNoteClick, onEmailClick }) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id: app.id, data: { app } });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ opacity: isDragging ? 0 : 1 }}
      className="cursor-grab active:cursor-grabbing touch-none"
    >
      <ApplicantCardContent
        app={app}
        onRatingClick={onRatingClick}
        onNoteClick={onNoteClick}
        onEmailClick={onEmailClick}
      />
    </div>
  );
}

// ── Droppable column ──────────────────────────────────────────────────────────
function KanbanColumn({ stage, applications, isOver, onRatingClick, onNoteClick, onEmailClick }) {
  const { setNodeRef } = useDroppable({ id: stage.id });
  return (
    <div className="flex flex-col w-64 shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`w-2.5 h-2.5 rounded-full ${stage.color} shrink-0`} />
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{stage.label}</span>
        <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
          {applications.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-2 space-y-2 min-h-[120px] transition-colors ${
          isOver ? 'bg-primary-50 ring-2 ring-primary-300' : 'bg-gray-100'
        }`}
      >
        {applications.map((app) => (
          <DraggableCard
            key={app.id}
            app={app}
            onRatingClick={onRatingClick}
            onNoteClick={onNoteClick}
            onEmailClick={onEmailClick}
          />
        ))}
        {applications.length === 0 && (
          <div className="flex items-center justify-center h-16 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}

// ── Modals ────────────────────────────────────────────────────────────────────
function NoteModal({ app, onClose, onSave, loading }) {
  const [note, setNote] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="font-semibold text-gray-900 mb-1">Add Note</h3>
        <p className="text-xs text-gray-400 mb-4">Private — not visible to {app.seeker?.fullName}</p>
        <textarea
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="input-field resize-none mb-4"
          placeholder="e.g. Strong technical background, follow up next week…"
          autoFocus
        />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
          <button
            onClick={() => onSave(note)}
            disabled={!note.trim() || loading}
            className="px-4 py-2 rounded-lg text-sm bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Saving…' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
}

function RatingModal({ app, onClose, onSave, loading }) {
  const [rating, setRating] = useState(app.employerRating ?? 0);
  const [hovered, setHovered] = useState(0);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
        <h3 className="font-semibold text-gray-900 mb-1">Rate Applicant</h3>
        <p className="text-xs text-gray-400 mb-5">{app.seeker?.fullName}</p>
        <div className="flex items-center justify-center gap-2 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              onMouseEnter={() => setHovered(i + 1)}
              onMouseLeave={() => setHovered(0)}
              className="focus:outline-none"
            >
              <svg
                className={`w-8 h-8 transition-colors ${
                  i < (hovered || rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'
                }`}
                viewBox="0 0 24 24" stroke="none"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
          <button
            onClick={() => onSave(rating)}
            disabled={!rating || loading}
            className="px-4 py-2 rounded-lg text-sm bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Saving…' : 'Save Rating'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmailModal({ app, onClose, onSend, loading }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-1">Email Applicant</h3>
        <p className="text-xs text-gray-400 mb-4">Sending to {app.seeker?.email}</p>
        <div className="space-y-3 mb-4">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="input-field"
            placeholder="Subject"
          />
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input-field resize-none"
            placeholder="Your message…"
          />
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
          <button
            onClick={() => onSend(subject, message)}
            disabled={!subject.trim() || !message.trim() || loading}
            className="px-4 py-2 rounded-lg text-sm bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Sending…' : 'Send Email'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main board ────────────────────────────────────────────────────────────────
export default function ApplicantsBoard() {
  const { id: jobId } = useParams();
  const qc = useQueryClient();

  const [columns, setColumns] = useState(() =>
    Object.fromEntries(STAGES.map((s) => [s.id, []]))
  );
  const [activeCard, setActiveCard] = useState(null);
  const [overStage, setOverStage] = useState(null);

  // Modals
  const [noteTarget,   setNoteTarget]   = useState(null);
  const [ratingTarget, setRatingTarget] = useState(null);
  const [emailTarget,  setEmailTarget]  = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['employer', 'applicants', jobId],
    queryFn: () => employerService.listApplicants(jobId, { limit: 200 }),
    enabled: Boolean(jobId),
  });

  // Distribute applications into stage columns
  useEffect(() => {
    const apps = data?.data?.applications ?? [];
    const cols = Object.fromEntries(STAGES.map((s) => [s.id, []]));
    apps.forEach((app) => {
      const stage = app.atsStage ?? 'applied';
      if (cols[stage]) cols[stage].push(app);
      else cols.applied.push(app);
    });
    setColumns(cols);
  }, [data]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  // Mutations
  const stageMutation = useMutation({
    mutationFn: ({ id, stage }) => employerService.updateStage(id, stage),
    onSuccess: () => toast.success('Stage updated'),
    onError: (e) => {
      toast.error(e.message);
      qc.invalidateQueries(['employer', 'applicants', jobId]);
    },
  });

  const noteMutation = useMutation({
    mutationFn: ({ id, note }) => employerService.addNote(id, note),
    onSuccess: () => { toast.success('Note saved'); setNoteTarget(null); },
    onError: (e) => toast.error(e.message),
  });

  const ratingMutation = useMutation({
    mutationFn: ({ id, rating }) => employerService.setRating(id, rating),
    onSuccess: () => { toast.success('Rating saved'); setRatingTarget(null); qc.invalidateQueries(['employer', 'applicants', jobId]); },
    onError: (e) => toast.error(e.message),
  });

  const emailMutation = useMutation({
    mutationFn: ({ id, subject, message }) => employerService.sendEmail(id, { subject, message }),
    onSuccess: () => { toast.success('Email sent'); setEmailTarget(null); },
    onError: (e) => toast.error(e.message),
  });

  // DnD handlers
  const handleDragStart = useCallback(({ active }) => {
    for (const apps of Object.values(columns)) {
      const found = apps.find((a) => a.id === active.id);
      if (found) { setActiveCard(found); break; }
    }
  }, [columns]);

  const handleDragOver = useCallback(({ over }) => {
    setOverStage(over?.id ?? null);
  }, []);

  const handleDragEnd = useCallback(({ active, over }) => {
    setActiveCard(null);
    setOverStage(null);
    if (!over) return;

    const appId   = active.id;
    const newStage = over.id;

    let srcStage = null;
    for (const [stage, apps] of Object.entries(columns)) {
      if (apps.find((a) => a.id === appId)) { srcStage = stage; break; }
    }
    if (!srcStage || srcStage === newStage) return;

    // Optimistic update
    const app = columns[srcStage].find((a) => a.id === appId);
    setColumns((prev) => ({
      ...prev,
      [srcStage]: prev[srcStage].filter((a) => a.id !== appId),
      [newStage]: [...prev[newStage], { ...app, atsStage: newStage }],
    }));

    stageMutation.mutate({ id: appId, stage: newStage });
  }, [columns, stageMutation]);

  const totalApplicants = Object.values(columns).reduce((s, a) => s + a.length, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/employer/jobs" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Jobs</Link>
            <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Applicants</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isLoading ? 'Loading…' : `${totalApplicants} Applicant${totalApplicants !== 1 ? 's' : ''}`}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Drag cards between columns to update ATS stage.</p>
        </div>

        {/* Stage summary pills */}
        <div className="flex flex-wrap gap-2">
          {STAGES.filter((s) => columns[s.id]?.length > 0).map((s) => (
            <span key={s.id} className={`badge ${atsStageColor(s.id)}`}>
              {s.label}: {columns[s.id].length}
            </span>
          ))}
        </div>
      </div>

      {/* Board */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <svg className="w-6 h-6 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 min-w-max">
              {STAGES.map((stage) => (
                <KanbanColumn
                  key={stage.id}
                  stage={stage}
                  applications={columns[stage.id] ?? []}
                  isOver={overStage === stage.id}
                  onNoteClick={setNoteTarget}
                  onRatingClick={setRatingTarget}
                  onEmailClick={setEmailTarget}
                />
              ))}
            </div>

            {/* Floating card while dragging */}
            <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
              {activeCard ? (
                <div className="rotate-1 scale-105 shadow-xl rounded-lg w-64">
                  <ApplicantCardContent app={activeCard} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      {/* Modals */}
      {noteTarget && (
        <NoteModal
          app={noteTarget}
          loading={noteMutation.isPending}
          onClose={() => setNoteTarget(null)}
          onSave={(note) => noteMutation.mutate({ id: noteTarget.id, note })}
        />
      )}
      {ratingTarget && (
        <RatingModal
          app={ratingTarget}
          loading={ratingMutation.isPending}
          onClose={() => setRatingTarget(null)}
          onSave={(rating) => ratingMutation.mutate({ id: ratingTarget.id, rating })}
        />
      )}
      {emailTarget && (
        <EmailModal
          app={emailTarget}
          loading={emailMutation.isPending}
          onClose={() => setEmailTarget(null)}
          onSend={(subject, message) => emailMutation.mutate({ id: emailTarget.id, subject, message })}
        />
      )}
    </div>
  );
}
