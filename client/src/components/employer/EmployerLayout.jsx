import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import ToastContainer from '../common/Toast.jsx';

function EditProfileModal({ user, onClose, onSave }) {
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) { setError('Name cannot be empty.'); return; }
    setLoading(true);
    setError('');
    try {
      await onSave({ fullName: fullName.trim() });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">Edit Profile</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Avatar preview */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {fullName?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{fullName || '—'}</p>
            <p className="text-xs text-primary-600">Employer</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full name</label>
            <input
              ref={inputRef}
              type="text"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setError(''); }}
              placeholder="Your full name"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : null}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const NAV = [
  {
    to: '/employer/dashboard', label: 'Dashboard',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
  },
  {
    to: '/employer/jobs', label: 'Job Listings',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>,
  },
  {
    to: '/employer/applications', label: 'Applications',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  },
  {
    to: '/employer/company', label: 'Company Profile',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
  },
  {
    to: '/employer/billing', label: 'Billing & Plans',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>,
  },
];

function SidebarNav({ user, onLogout, onEditProfile }) {
  return (
    <nav className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" /></svg>
          </div>
          <span className="font-extrabold text-gray-900 text-base"><span className="text-primary-600">Work</span>Hunt</span>
        </Link>
        {/* User profile card — click to edit */}
        <button
          type="button"
          onClick={onEditProfile}
          className="w-full group flex items-center gap-3 p-3 rounded-2xl bg-primary-50 border border-primary-100 hover:border-primary-300 hover:bg-primary-100 transition-colors text-left"
        >
          <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.fullName?.[0]?.toUpperCase() ?? user?.name?.[0]?.toUpperCase() ?? 'E'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName ?? user?.name}</p>
            <p className="text-xs text-primary-600 font-medium">Employer</p>
          </div>
          <svg className="w-3.5 h-3.5 text-primary-400 group-hover:text-primary-600 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
          </svg>
        </button>
      </div>

      {/* Post a Job CTA */}
      <div className="px-4 py-4 border-b border-gray-100">
        <Link
          to="/employer/jobs/new"
          className="flex items-center justify-center gap-2 w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Post a New Job
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Manage</p>
        {NAV.map((item) => (
          <NavLink
            key={item.to} to={item.to}
            className={({ isActive }) =>
              isActive ? 'sidebar-link-active' : 'sidebar-link'
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Bottom */}
      <div className="px-3 pb-4 pt-3 border-t border-gray-100">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Sign Out
        </button>
      </div>
    </nav>
  );
}

export default function EmployerLayout() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-gray-100 shadow-sm">
        <SidebarNav user={user} onLogout={handleLogout} onEditProfile={() => setShowEditProfile(true)} />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 shadow-2xl animate-slide-up">
            <div className="absolute top-3 right-3 z-10">
              <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">✕</button>
            </div>
            <SidebarNav user={user} onLogout={() => { handleLogout(); setSidebarOpen(false); }} onEditProfile={() => { setShowEditProfile(true); setSidebarOpen(false); }} />
          </aside>
        </div>
      )}

      {/* Edit profile modal */}
      {showEditProfile && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditProfile(false)}
          onSave={updateUser}
        />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-gray-900 text-sm">Employer Dashboard</span>
          <Link to="/employer/jobs/new" className="ml-auto btn-primary text-xs py-1.5 px-3">
            + Post Job
          </Link>
        </div>

        <main className="p-5 lg:p-8">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
