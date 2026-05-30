import Badge from '../../components/common/Badge';

export default function UserDetailPanel({ data, onClose, onStatusToggle }) {
  const { user, stats } = data?.data || {};

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 overflow-y-auto flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h3 className="font-semibold text-white">User Detail</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg">✕</button>
        </div>

        {!user ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Identity */}
            <div>
              <p className="text-lg font-semibold text-white">{user.fullName}</p>
              <p className="text-sm text-slate-400">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge label={user.role} />
                <Badge label={user.isActive ? 'active' : 'inactive'} />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800 rounded-lg p-3">
                <p className="text-xs text-slate-400">Applications</p>
                <p className="text-xl font-bold text-white">{stats?.totalApplications ?? 0}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <p className="text-xs text-slate-400">Jobs Posted</p>
                <p className="text-xl font-bold text-white">{stats?.totalJobs ?? 0}</p>
              </div>
            </div>

            {/* Employer profile info */}
            {user.employerProfile && (
              <div className="bg-slate-800/50 rounded-lg p-3 space-y-1">
                <p className="text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">Company</p>
                <p className="text-sm text-slate-200">{user.employerProfile.companyName}</p>
                <Badge label={user.employerProfile.subscriptionPlan} />
              </div>
            )}

            {/* Seeker profile info */}
            {user.seekerProfile?.headline && (
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">Profile</p>
                <p className="text-sm text-slate-200">{user.seekerProfile.headline}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex justify-between">
                <span>Joined</span>
                <span className="text-slate-300">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Verified</span>
                <span className={user.isVerified ? 'text-emerald-400' : 'text-amber-400'}>
                  {user.isVerified ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-800">
              <button
                className={`w-full ${user.isActive ? 'admin-btn-danger' : 'admin-btn-primary'}`}
                onClick={() => onStatusToggle(user)}
              >
                {user.isActive ? 'Deactivate Account' : 'Activate Account'}
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
