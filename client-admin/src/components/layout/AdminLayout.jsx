import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

const NAV_SECTIONS = [
  {
    items: [
      { to: '/dashboard', label: 'Dashboard' },
    ],
  },
  {
    label: 'Users',
    items: [
      { to: '/employers', label: 'Employers' },
      { to: '/seekers', label: 'Job Seekers' },
      { to: '/users', label: 'All Users' },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/jobs', label: 'Jobs' },
      { to: '/applications', label: 'Applications' },
    ],
  },
  {
    label: 'Billing',
    items: [
      { to: '/subscriptions', label: 'Subscriptions' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/reports', label: 'Reports' },
      { to: '/analytics', label: 'Analytics' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/audit-log', label: 'Audit Log' },
      { to: '/settings/categories', label: 'Categories' },
      { to: '/settings/admins', label: 'Admin Users' },
    ],
  },
];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside
        className={`flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            A
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-white truncate">Admin Portal</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {NAV_SECTIONS.map((section, si) => (
            <div key={si}>
              {section.label && !collapsed && (
                <p className="px-3 pt-3 pb-1 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                  {section.label}
                </p>
              )}
              {section.label && collapsed && si > 0 && (
                <div className="my-2 border-t border-slate-800" />
              )}
              {section.items.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-violet-600/20 text-violet-300 font-medium'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`
                  }
                  title={collapsed ? label : undefined}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 opacity-60" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Admin user + logout */}
        <div className="border-t border-slate-800 p-3 flex-shrink-0">
          {!collapsed && (
            <div className="mb-2 px-2">
              <p className="text-xs font-medium text-slate-300 truncate">{admin?.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{admin?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-900/20 transition-colors"
            title={collapsed ? 'Sign out' : undefined}
          >
            <span className="text-xs flex-shrink-0">✕</span>
            {!collapsed && 'Sign out'}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900 flex-shrink-0">
          <h1 className="text-sm font-medium text-slate-300">
            {import.meta.env.VITE_APP_NAME || 'Admin Portal'}
          </h1>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              System online
            </span>
            <span className="text-slate-600 text-xs">
              {admin?.role?.toUpperCase()}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
