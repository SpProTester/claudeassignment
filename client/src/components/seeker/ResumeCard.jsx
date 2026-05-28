import { formatFileSize, timeAgo } from '../../utils/helpers.js';

const FILE_ICON = (
  <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

export default function ResumeCard({ resume, onSetDefault, onDelete, isSettingDefault, isDeleting }) {
  const fileUrl = resume.url ?? `/uploads/${resume.storagePath}`;
  const ext = resume.fileName?.split('.').pop()?.toUpperCase() ?? 'PDF';

  return (
    <div className={`bg-white rounded-xl border-2 shadow-card transition-shadow duration-200 hover:shadow-md ${resume.isDefault ? 'border-primary-400' : 'border-gray-200'}`}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="shrink-0 bg-red-50 rounded-lg p-2">{FILE_ICON}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-900 text-sm truncate">{resume.fileName}</h3>
              {resume.isDefault && (
                <span className="badge bg-primary-100 text-primary-700 shrink-0">★ Default</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="badge bg-gray-100 text-gray-600 mr-1.5">{ext}</span>
              {formatFileSize(resume.fileSize)} · Uploaded {timeAgo(resume.createdAt)}
            </p>
            {resume.label && (
              <p className="text-xs text-gray-400 mt-1 italic">{resume.label}</p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-100 px-5 py-3 flex items-center gap-3 flex-wrap">
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          Preview
        </a>

        {!resume.isDefault && (
          <button
            onClick={onSetDefault}
            disabled={isSettingDefault}
            className="text-xs font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            {isSettingDefault ? 'Setting…' : 'Set Default'}
          </button>
        )}

        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="ml-auto text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50 flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
          {isDeleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
