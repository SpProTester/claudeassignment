import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seekerService } from '../../services/seeker.service.js';
import ResumeCard from '../../components/seeker/ResumeCard.jsx';
import { toast } from '../../store/uiStore.js';

const ACCEPTED = '.pdf,.doc,.docx';
const MAX_MB = 10;

function UploadZone({ onFileSelect, isUploading, progress }) {
  const inputRef = useRef(null);
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="border-2 border-dashed border-gray-300 hover:border-primary-400 rounded-xl p-8 text-center transition-colors cursor-pointer"
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept={ACCEPTED} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileSelect(f); e.target.value = ''; }} />
      <div className="mx-auto w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      </div>
      {isUploading ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Uploading… {progress}%</p>
          <div className="w-40 mx-auto bg-gray-200 rounded-full h-1.5">
            <div className="bg-primary-600 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm font-medium text-gray-700">Drag &amp; drop your resume here</p>
          <p className="text-xs text-gray-400 mt-1">or click to browse — PDF, DOC, DOCX · max {MAX_MB} MB</p>
          <button type="button" className="btn-outline mt-4 text-sm">Choose File</button>
        </>
      )}
    </div>
  );
}

// Card for builder-created resumes
function BuiltResumeCard({ resume, onSetDefault, onDelete, isSettingDefault, isDeleting }) {
  const navigate = useNavigate();
  const TEMPLATE_EMOJI = { modern: '🟣', corporate: '🔵', minimal: '⬜', creative: '🌈', executive: '👔' };
  const tplSlug = resume.template?.slug ?? '';
  const emoji   = TEMPLATE_EMOJI[tplSlug] ?? '📄';

  return (
    <div className={`bg-white rounded-2xl border ${resume.isDefault ? 'border-primary-300 ring-2 ring-primary-100' : 'border-gray-200'} p-4`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-lg shrink-0">{emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900 truncate">{resume.label || 'Untitled Resume'}</span>
            {resume.isDefault && (
              <span className="badge badge-purple text-xs">Default</span>
            )}
            <span className="badge bg-blue-50 text-blue-700 text-xs">Built</span>
            {resume.template?.name && (
              <span className="badge bg-gray-100 text-gray-600 text-xs capitalize">{resume.template.name}</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Created {new Date(resume.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            {resume.updatedAt !== resume.createdAt && ` · Updated ${new Date(resume.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!resume.isDefault && (
            <button onClick={onSetDefault} disabled={isSettingDefault} className="text-xs text-gray-500 hover:text-primary-600 font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-primary-300 transition-colors disabled:opacity-50">
              {isSettingDefault ? 'Setting…' : 'Set Default'}
            </button>
          )}
          <button onClick={() => navigate(`/seeker/resume/${resume.id}/edit`)}
            className="text-xs text-primary-600 hover:text-primary-800 font-medium border border-primary-200 rounded-lg px-2.5 py-1.5 hover:bg-primary-50 transition-colors">
            Edit
          </button>
          <a href={`/api/seekers/resume/${resume.id}/export`} target="_blank" rel="noreferrer"
            className="text-xs text-gray-500 hover:text-gray-800 font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-gray-300 transition-colors">
            PDF
          </a>
          <button onClick={onDelete} disabled={isDeleting}
            className="text-xs text-red-500 hover:text-red-700 font-medium border border-red-100 rounded-lg px-2.5 py-1.5 hover:bg-red-50 transition-colors disabled:opacity-50">
            {isDeleting ? '…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SeekerResume() {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [labelInput, setLabelInput] = useState('');
  const [showLabel, setShowLabel] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['seeker', 'resumes'],
    queryFn: seekerService.getResumes,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, label }) => {
      const fd = new FormData();
      fd.append('resume', file);
      if (label) fd.append('label', label);
      return seekerService.uploadResume(fd, setUploadProgress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker', 'resumes'] });
      queryClient.invalidateQueries({ queryKey: ['my-resumes'] });
      toast.success('Resume uploaded successfully.');
      setPendingFile(null); setLabelInput(''); setShowLabel(false); setUploadProgress(0);
    },
    onError: (err) => { toast.error(err.message); setUploadProgress(0); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => seekerService.deleteResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker', 'resumes'] });
      queryClient.invalidateQueries({ queryKey: ['my-resumes'] });
      toast.success('Resume deleted.');
    },
    onError: (err) => toast.error(err.message),
  });

  const defaultMutation = useMutation({
    mutationFn: (id) => seekerService.setDefaultResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker', 'resumes'] });
      queryClient.invalidateQueries({ queryKey: ['my-resumes'] });
      toast.success('Default resume updated.');
    },
    onError: (err) => toast.error(err.message),
  });

  const handleFileSelect = (file) => {
    if (file.size > MAX_MB * 1024 * 1024) { toast.error(`File must be under ${MAX_MB} MB.`); return; }
    setPendingFile(file);
    setShowLabel(true);
  };

  const allResumes   = data?.resumes ?? [];
  const builtResumes = allResumes.filter(r => r.resumeType === 'built');
  const uploaded     = allResumes.filter(r => r.resumeType !== 'built');

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resume</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload or build a resume. Your default resume is used when applying for jobs.
          </p>
        </div>
        <Link to="/seeker/resume/builder/new" className="btn-primary shrink-0 flex items-center gap-2 text-sm py-2.5 px-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Build Resume
        </Link>
      </div>

      {/* Builder promo card (shown when no built resumes) */}
      {builtResumes.length === 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-100 rounded-2xl p-5 mb-6 flex items-center gap-5">
          <div className="text-4xl shrink-0">✨</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-primary-900">Try the Resume Builder</p>
            <p className="text-xs text-primary-700 mt-0.5">Create a professional resume from scratch with real-time preview, 5 templates, and instant PDF download.</p>
          </div>
          <Link to="/seeker/resume/builder/new" className="btn-primary shrink-0 text-sm py-2 px-4">Create Resume</Link>
        </div>
      )}

      {/* Upload section */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M8 12l4-4m0 0l4 4m-4-4v9" /></svg>
          Upload Resume
        </h2>
        <UploadZone onFileSelect={handleFileSelect} isUploading={uploadMutation.isPending} progress={uploadProgress} />
        {showLabel && pendingFile && !uploadMutation.isPending && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800 truncate">📄 {pendingFile.name}</p>
              <input type="text" value={labelInput} onChange={(e) => setLabelInput(e.target.value)}
                placeholder="Optional label (e.g. 'Frontend 2024')" className="mt-2 w-full input-field text-xs" />
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => { setPendingFile(null); setShowLabel(false); }} className="btn-outline text-xs px-3 py-1.5">Cancel</button>
              <button onClick={() => uploadMutation.mutate({ file: pendingFile, label: labelInput })} className="btn-primary text-xs px-3 py-1.5">Upload</button>
            </div>
          </div>
        )}
      </div>

      {/* Resume list */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          My Resumes
          {allResumes.length > 0 && <span className="text-gray-400 font-normal text-sm">({allResumes.length})</span>}
        </h2>

        {isLoading ? (
          <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-200 h-24 animate-pulse" />)}</div>
        ) : error ? (
          <div className="text-center py-10 text-red-600 text-sm">{error.message}</div>
        ) : allResumes.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-3xl mb-2">📄</p>
            <p className="text-sm font-medium text-gray-700">No resumes yet</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Upload a file or build one using our builder.</p>
            <Link to="/seeker/resume/builder/new" className="btn-primary text-sm">Build a Resume</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Built resumes first */}
            {builtResumes.map((r) => (
              <BuiltResumeCard
                key={r.id}
                resume={r}
                onSetDefault={() => defaultMutation.mutate(r.id)}
                onDelete={() => deleteMutation.mutate(r.id)}
                isSettingDefault={defaultMutation.isPending && defaultMutation.variables === r.id}
                isDeleting={deleteMutation.isPending && deleteMutation.variables === r.id}
              />
            ))}
            {/* Uploaded resumes */}
            {uploaded.map((r) => (
              <ResumeCard
                key={r.id}
                resume={r}
                onSetDefault={() => defaultMutation.mutate(r.id)}
                onDelete={() => deleteMutation.mutate(r.id)}
                isSettingDefault={defaultMutation.isPending && defaultMutation.variables === r.id}
                isDeleting={deleteMutation.isPending && deleteMutation.variables === r.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
