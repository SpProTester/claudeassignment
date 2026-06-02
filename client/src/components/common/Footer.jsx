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
    { label: 'Manage Applicants',    to: '/employer/jobs' },
    { label: 'Company Profile',      to: '/employer/company' },
    { label: 'Pricing Plans',        to: '/pricing' },
  ],
  'Resources': [
    { label: 'Career Advice',        to: '/career-advice' },
    { label: 'Salary Guide',         to: '/salary-tools' },
    { label: 'Resume Tips',          to: '/career-advice' },
    { label: 'Interview Prep',       to: '/career-advice' },
    { label: 'Job Market Trends',    to: '/salary-tools' },
  ],
  'Company': [
    { label: 'About Us',             to: '/about' },
    { label: 'Contact',              to: '/contact' },
    { label: 'Privacy Policy',       to: '/privacy-policy' },
    { label: 'Terms of Service',     to: '/terms' },
    { label: 'Cookie Settings',      to: '/privacy-policy' },
  ],
};

const SOCIAL = [
  {
    id: 'twitter',
    href: '#',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: 'linkedin',
    href: '#',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    id: 'facebook',
    href: '#',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="bg-gray-950 text-gray-400">

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-5">
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
            <div className="flex gap-2.5 mt-6">
              {SOCIAL.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  aria-label={s.id}
                  className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-primary-600 text-gray-400 hover:text-white flex items-center justify-center transition-all duration-150"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-5">{section}</h4>
              <ul className="space-y-3">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-gray-500 hover:text-gray-200 transition-colors duration-150"
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
        <div className="border-t border-gray-800/60 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} WorkHunt, Inc. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/privacy-policy"  className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms"           className="hover:text-gray-400 transition-colors">Terms of Service</Link>
            <Link to="/accessibility"   className="hover:text-gray-400 transition-colors">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
