import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import NotificationBell from './NotificationBell.jsx';

function MonsterLogo() {
  return (
    <Link to="/" className="flex items-center gap-2 shrink-0">
      <div className="flex items-center justify-center w-9 h-9 bg-primary-600 rounded-xl">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
        </svg>
      </div>
      <span className="text-xl font-extrabold tracking-tight text-gray-900">
        <span className="text-primary-600">Work</span>Hunt
      </span>
    </Link>
  );
}

export default function Navbar() {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen]       = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [resumeOpen, setResumeOpen]   = useState(false);
  const profileRef = useRef(null);
  const resumeRef  = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
    setMenuOpen(false);
  };

  /* close dropdowns on outside click */
  useEffect(() => {
    function handle(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (resumeRef.current  && !resumeRef.current.contains(e.target))  setResumeOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const dashboardPath = role === 'employer' ? '/employer/dashboard' : '/seeker/dashboard';

  return (
    <header className="sticky top-0 z-50 bg-white shadow-nav border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <MonsterLogo />

          {/* Desktop center nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { to: '/jobs',          label: 'Find Jobs' },
              { to: '/salary-tools',  label: 'Salary Tools' },
              { to: '/career-advice', label: 'Career Advice' },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            {/* Resume dropdown */}
            <div className="relative" ref={resumeRef}>
              <button
                onClick={() => setResumeOpen((o) => !o)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-150"
              >
                Resume
                <svg className={`w-3.5 h-3.5 transition-transform duration-150 ${resumeOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {resumeOpen && (
                <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 py-1 z-50 animate-fade-in">
                  <Link
                    to={user && role === 'seeker' ? '/seeker/resume' : '/login'}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                    onClick={() => setResumeOpen(false)}
                  >
                    <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    My Resumes
                  </Link>
                  <Link
                    to={user && role === 'seeker' ? '/seeker/resume/builder/new' : '/login'}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                    onClick={() => setResumeOpen(false)}
                  >
                    <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Build a Resume
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  <Link
                    to="/career-advice"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                    onClick={() => setResumeOpen(false)}
                  >
                    <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Resume Tips
                  </Link>
                </div>
              )}
            </div>

            {user && (
              <NavLink
                to={dashboardPath}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`
                }
              >
                Dashboard
              </NavLink>
            )}
          </nav>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <NotificationBell />
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((o) => !o)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-150"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                      {user.fullName?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                      {user.fullName?.split(' ')[0] ?? 'Account'}
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 py-1 animate-fade-in">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.fullName}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                      </div>
                      <Link
                        to={dashboardPath}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                        onClick={() => setProfileOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                        </svg>
                        Dashboard
                      </Link>
                      {role === 'seeker' && (
                        <Link
                          to="/seeker/profile"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                          onClick={() => setProfileOpen(false)}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          My Profile
                        </Link>
                      )}
                      {role === 'employer' && (
                        <Link
                          to="/employer/jobs"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                          onClick={() => setProfileOpen(false)}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          My Jobs
                        </Link>
                      )}
                      <div className="border-t border-gray-100 mt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-600 hover:text-primary-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
                <Link
                  to="/register?role=employer"
                  className="text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 border border-primary-600 px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Post a Job
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 space-y-1 animate-slide-up">
            {[
              { to: '/jobs',          label: 'Find Jobs' },
              { to: '/salary-tools',  label: 'Salary Tools' },
              { to: '/career-advice', label: 'Career Advice' },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </NavLink>
            ))}
            <NavLink
              to={user && role === 'seeker' ? '/seeker/resume' : '/login'}
              className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl"
              onClick={() => setMenuOpen(false)}
            >
              Resume
            </NavLink>
            {role !== 'seeker' && (
              <NavLink
                to="/pricing"
                className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl"
                onClick={() => setMenuOpen(false)}
              >
                For Employers
              </NavLink>
            )}
            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center px-3 py-2.5 text-sm font-semibold text-primary-600 hover:bg-primary-50 rounded-xl"
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                </Link>
                <Link
                  to="/register?role=employer"
                  className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl"
                  onClick={() => setMenuOpen(false)}
                >
                  Post a Job
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
