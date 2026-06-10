import { useState, useEffect } from 'react';

const PROVIDERS = [
  {
    id: 'microsoft_teams',
    label: 'Microsoft Teams',
    placeholder: 'https://teams.microsoft.com/l/meetup-join/…',
    ring: 'ring-1 ring-indigo-300 border-indigo-400 bg-indigo-50 text-indigo-700',
  },
  {
    id: 'google_meet',
    label: 'Google Meet',
    placeholder: 'https://meet.google.com/xxx-xxxx-xxx',
    ring: 'ring-1 ring-emerald-300 border-emerald-400 bg-emerald-50 text-emerald-700',
  },
  {
    id: 'other',
    label: 'Other (Zoom, etc.)',
    placeholder: 'https://zoom.us/j/…',
    ring: 'ring-1 ring-gray-300 border-gray-400 bg-gray-50 text-gray-700',
  },
];

const pad = (n) => String(n).padStart(2, '0');

// Converts a stored ISO date into the value <input type="datetime-local"> expects
const toInputValue = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * ScheduleInterviewModal
 * Props:
 *   isOpen      — bool
 *   onClose     — () => void
 *   application — application record (candidate/job display + reschedule pre-fill)
 *   onSubmit    — (values: { scheduledAt, meetingProvider, meetingLink, notes }) => void
 *   onSkip      — () => void   — move straight to "Interview" without scheduling details
 *   isPending   — bool
 */
export default function ScheduleInterviewModal({ isOpen, onClose, application, onSubmit, onSkip, isPending }) {
  const [scheduledAt, setScheduledAt] = useState('');
  const [provider, setProvider]       = useState('microsoft_teams');
  const [meetingLink, setMeetingLink] = useState('');
  const [notes, setNotes]             = useState('');
  const [touched, setTouched]         = useState(false);

  // Re-seed the form whenever the modal opens (handles both fresh-schedule and reschedule)
  useEffect(() => {
    if (!isOpen) return;
    setScheduledAt(toInputValue(application?.interviewScheduledAt));
    setProvider(application?.interviewMeetingProvider || 'microsoft_teams');
    setMeetingLink(application?.interviewMeetingLink || '');
    setNotes(application?.interviewNotes || '');
    setTouched(false);
  }, [isOpen, application]);

  if (!isOpen) return null;

  const seekerName     = application?.seeker?.fullName ?? 'this candidate';
  const jobTitle       = application?.job?.title ?? 'this role';
  const isReschedule   = Boolean(application?.interviewMeetingLink);
  const activeProvider = PROVIDERS.find((p) => p.id === provider) ?? PROVIDERS[0];

  const dateValid = Boolean(scheduledAt) && new Date(scheduledAt).getTime() > Date.now();
  const linkValid = isValidUrl(meetingLink);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!dateValid || !linkValid || isPending) return;
    onSubmit({
      scheduledAt: new Date(scheduledAt).toISOString(),
      meetingProvider: provider,
      meetingLink: meetingLink.trim(),
      notes: notes.trim() || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25M3 18.75v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{isReschedule ? 'Reschedule Interview' : 'Schedule Interview'}</h2>
              <p className="text-sm text-gray-500">
                With <span className="font-semibold text-gray-700">{seekerName}</span> for{' '}
                <span className="font-semibold text-gray-700">{jobTitle}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Form body */}
        <div className="px-6 py-5 space-y-5">
          {/* Date & time */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date &amp; time</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
            {touched && !dateValid && (
              <p className="text-xs text-red-500 mt-1">Pick a date and time in the future.</p>
            )}
          </div>

          {/* Provider */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Meeting platform</label>
            <div className="grid grid-cols-3 gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id)}
                  className={`text-xs font-semibold px-3 py-2.5 rounded-xl border transition-colors ${
                    provider === p.id ? p.ring : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Meeting link */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Meeting link</label>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder={activeProvider.placeholder}
              className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-200 placeholder-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              Create the meeting in {activeProvider.label} (or your preferred app) and paste the join link here.
            </p>
            {touched && !linkValid && (
              <p className="text-xs text-red-500 mt-1">Enter a valid link starting with http:// or https://</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Note for the candidate <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please join 5 minutes early and have your portfolio ready."
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none placeholder-gray-400"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-1 space-y-3">
          <button
            type="submit"
            disabled={isPending}
            className="w-full text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 rounded-xl py-3 transition-colors"
          >
            {isPending ? 'Sending…' : 'Send Invitation & Notify Candidate'}
          </button>
          {!isReschedule && (
            <button
              type="button"
              onClick={onSkip}
              disabled={isPending}
              className="w-full text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              Just move to "Interview" without scheduling
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
