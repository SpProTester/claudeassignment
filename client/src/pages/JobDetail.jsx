import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobsService, applicationsService } from '../services/jobs.service.js';
import { useAuth } from '../hooks/useAuth.js';
import { jobTypeBadgeColor, formatSalary, timeAgo } from '../utils/helpers.js';
import Button from '../components/common/Button.jsx';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [applyModal, setApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    jobsService
      .getById(id)
      .then((data) => setJob(data.job))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setApplying(true);
    setApplyError('');
    try {
      await applicationsService.apply(id, { coverLetter });
      setApplied(true);
      setApplyModal(false);
    } catch (err) {
      setApplyError(err.message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-100 rounded w-1/3" />
        <div className="h-40 bg-gray-100 rounded" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">{error || 'Job not found.'}</p>
        <Link to="/jobs" className="text-primary-600 mt-4 inline-block hover:underline">
          ← Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/jobs" className="text-sm text-primary-600 hover:underline mb-6 inline-block">
        ← Back to Jobs
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
        {/* Header */}
        <div className="p-7 border-b border-gray-100">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-400 shrink-0">
              {job.company?.logoUrl ? (
                <img src={job.company.logoUrl} alt={job.company.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                job.company?.name?.[0] || 'J'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-gray-600 mt-1">{job.company?.name}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`badge ${jobTypeBadgeColor(job.jobType)} capitalize`}>
                  {job.jobType}
                </span>
                <span className="badge bg-gray-100 text-gray-700 capitalize">{job.experienceLevel}</span>
                {job.location && (
                  <span className="text-xs text-gray-500">📍 {job.location}</span>
                )}
                <span className="text-xs text-gray-400">Posted {timeAgo(job.createdAt)}</span>
              </div>
            </div>
            <div className="shrink-0">
              {applied ? (
                <span className="badge bg-green-100 text-green-700 px-4 py-2 text-sm">
                  ✓ Applied
                </span>
              ) : (
                <Button onClick={() => user ? setApplyModal(true) : navigate('/login')}>
                  Apply Now
                </Button>
              )}
            </div>
          </div>

          {(job.salaryMin || job.salaryMax) && (
            <p className="mt-4 text-sm font-medium text-green-700 bg-green-50 inline-block px-3 py-1 rounded-full">
              💰 {formatSalary(job.salaryMin, job.salaryMax)} / year
            </p>
          )}
        </div>

        {/* Body */}
        <div className="p-7 space-y-7">
          <section>
            <h2 className="text-base font-semibold text-gray-800 mb-3">Job Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </section>

          {job.responsibilities && (
            <section>
              <h2 className="text-base font-semibold text-gray-800 mb-3">Responsibilities</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{job.responsibilities}</p>
            </section>
          )}

          {job.requirements && (
            <section>
              <h2 className="text-base font-semibold text-gray-800 mb-3">Requirements</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
            </section>
          )}

          {job.skills?.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-gray-800 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((s) => (
                  <span key={s} className="badge bg-blue-50 text-blue-700">{s}</span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {applyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-7">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Apply for {job.title}</h2>
            <p className="text-sm text-gray-500 mb-5">{job.company?.name}</p>

            {applyError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                {applyError}
              </div>
            )}

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Letter <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                  className="input-field resize-none"
                  placeholder="Briefly introduce yourself and why you're a great fit..."
                />
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <Button type="button" variant="ghost" onClick={() => setApplyModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={applying}>
                  Submit Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
