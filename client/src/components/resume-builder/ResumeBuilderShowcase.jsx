import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';

export default function ResumeBuilderShowcase() {
  const { user } = useContext(AuthContext);
  const isSeekerLoggedIn = user?.role === 'seeker';

  return (
    <section className="py-10 bg-white border-y border-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-8 border border-primary-200">
          {/* Left: Content */}
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Build Your Resume in Minutes
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              {isSeekerLoggedIn
                ? 'Create a professional resume with our AI-powered builder and stand out to employers.'
                : 'Create a professional resume with multiple templates and stand out to top employers.'}
            </p>
          </div>

          {/* Right: CTA Button */}
          <div className="flex-shrink-0">
            {isSeekerLoggedIn ? (
              <Link
                to="/seeker/resume/builder/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors shadow-md whitespace-nowrap"
              >
                Create Resume
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <Link
                to="/register?role=seeker"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors shadow-md whitespace-nowrap"
              >
                Get Started Free
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
