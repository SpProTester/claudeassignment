import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

const FOOTER_LINKS = {
  'For Job Seekers': [
    { label: 'Browse Jobs',          to: '/jobs' },
    { label: 'Create Free Account',  to: '/register' },
    { label: 'My Applications',      to: '/seeker/applications' },
    { label: 'Saved Jobs',           to: '/seeker/saved-jobs' },
    { label: 'Job Alerts',           to: '/seeker/alerts' },
    { label: 'My Resume',            to: '/seeker/resume' },
  ],
  'For Employers': [
    { label: 'Post a Job',           to: '/register?role=employer' },
    { label: 'Employer Dashboard',   to: '/employer/dashboard' },
    { label: 'Manage Applicants',    to: '/employer/jobs' },
    { label: 'Company Profile',      to: '/employer/company' },
    { label: 'Pricing Plans',        to: '/pricing' },
  ],
  'Resources': [
    { label: 'Career Advice',        to: '/jobs' },
    { label: 'Salary Guide',         to: '/jobs' },
    { label: 'Resume Tips',          to: '/jobs' },
    { label: 'Interview Prep',       to: '/jobs' },
    { label: 'Job Market Trends',    to: '/jobs' },
  ],
  'Company': [
    { label: 'About Us',             to: '/' },
    { label: 'Contact',              to: '/' },
    { label: 'Privacy Policy',       to: '/' },
    { label: 'Terms of Service',     to: '/' },
    { label: 'Cookie Settings',      to: '/' },
  ],
};

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="bg-gray-950 text-gray-400">
      {/* Top CTA band — guests only */}
      {!user && (
        <div className="bg-primary-600 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-white text-xl font-bold">Ready to find your next opportunity?</h3>
              <p className="text-primary-200 text-sm mt-1">Join thousands of professionals landing their dream jobs.</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link to="/register" className="btn-white text-sm">
                Create Free Account
              </Link>
              <Link to="/jobs" className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border-2 border-white text-white font-semibold text-sm hover:bg-primary-700 transition-colors">
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                </svg>
              </div>
              <span className="text-white font-extrabold text-lg tracking-tight">
                <span className="text-primary-400">Work</span>Hunt
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500">
              Connecting talent with opportunity. Find your next role or hire the best candidates today.
            </p>
            {/* Social links */}
            <div className="flex gap-3 mt-5">
              {['twitter', 'linkedin', 'facebook'].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-colors duration-150"
                  aria-label={s}
                >
                  <span className="sr-only">{s}</span>
                  <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-white text-sm font-semibold mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-gray-500 hover:text-white transition-colors duration-150"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} WorkHunt. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-gray-400 transition-colors">Privacy</Link>
            <Link to="/" className="hover:text-gray-400 transition-colors">Terms</Link>
            <Link to="/" className="hover:text-gray-400 transition-colors">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
