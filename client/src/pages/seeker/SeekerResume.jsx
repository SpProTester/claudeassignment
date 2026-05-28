import { useRef, useState } from 'react';
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
      className="border-2 border-dashed border-gray-300 hover:border-primary-400 rounded-xl p-10 text-center transition-colors cursor-pointer"
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
          e.target.value = '';
        }}
      />
      <div className="mx-auto w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      </div>
      {isUploading ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Uploading… {progress}%</p>
          <div className="w-48 mx-auto bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm font-medium text-gray-700">Drag &amp; drop your resume here</p>
          <p className="text-xs text-gray-400 mt-1.5">or click to browse — PDF, DOC, DOCX · max {MAX_MB} MB</p>
          <button type="button" className="btn-primary mt-5 text-sm">
            Choose File
          </button>
        </>
      )}
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
      const formData = new FormData();
      formData.append('resume', file);
      if (label) formData.append('label', label);
      return seekerService.uploadResume(formData, setUploadProgress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker', 'resumes'] });
      queryClient.invalidateQueries({ queryKey: ['seeker', 'dashboard'] });
      toast.success('Resume uploaded successfully.');
      setPendingFile(null);
      setLabelInput('');
      setShowLabel(false);
      setUploadProgress(0);
    },
    onError: (err) => {
      toast.error(err.message);
      setUploadProgress(0);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => seekerService.deleteResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker', 'resumes'] });
      toast.success('Resume deleted.');
    },
    onError: (err) => toast.error(err.message),
  });

  const defaultMutation = useMutation({
    mutationFn: (id) => seekerService.setDefaultResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker', 'resumes'] });
      toast.success('Default resume updated.');
    },
    onError: (err) => toast.error(err.message),
  });

  const handleFileSelect = (file) => {
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`File must be under ${MAX_MB} MB.`);
      return;
    }
    setPendingFile(file);
    setShowLabel(true);
  };

  const handleUpload = () => {
    if (!pendingFile) return;
    uploadMutation.mutate({ file: pendingFile, label: labelInput });
  };

  const resumes = data?.resumes ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Resume</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload and manage your resumes. Employers see your default resume when you apply.
        </p>
      </div>

      {/* Upload zone */}
      <div className="mb-8">
        <UploadZone
          onFileSelect={handleFileSelect}
          isUploading={uploadMutation.isPending}
          progress={uploadProgress}
        />

        {/* Label + confirm after file selection */}
        {showLabel && pendingFile && !uploadMutation.isPending && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800 truncate">
                📄 {pendingFile.name}
              </p>
              <input
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="Optional label (e.g. 'Frontend 2024')"
                className="mt-2 w-full input-field text-xs"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => { setPendingFile(null); setShowLabel(false); }}
                className="btn-outline text-xs px-3 py-1.5"
              >
                Cancel
              </button>
              <button onClick={handleUpload} className="btn-primary text-xs px-3 py-1.5">
                Upload
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Resume list */}
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        My Resumes{resumes.length > 0 && <span className="text-gray-400 font-normal ml-2">({resumes.length})</span>}
      </h2>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 h-28 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-600 text-sm">{error.message}</div>
      ) : resumes.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-2xl mb-2">📄</p>
          <p className="text-sm font-medium text-gray-700">No resumes uploaded yet</p>
          <p className="text-xs text-gray-400 mt-1">Upload your first resume to start applying.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onSetDefault={() => defaultMutation.mutate(resume.id)}
              onDelete={() => deleteMutation.mutate(resume.id)}
              isSettingDefault={defaultMutation.isPending && defaultMutation.variables === resume.id}
              isDeleting={deleteMutation.isPending && deleteMutation.variables === resume.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
