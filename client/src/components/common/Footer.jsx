import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">JP</span>
              </div>
              <span className="text-white font-bold">Job Portal</span>
            </div>
            <p className="text-sm leading-relaxed">
              Connect talent with opportunity. Find your next role or hire the best candidates.
            </p>
          </div>

          <div>
            <h3 className="text-white text-sm font-semibold mb-3">For Job Seekers</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">My Applications</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-sm font-semibold mb-3">For Employers</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register?role=employer" className="hover:text-white transition-colors">Post a Job</Link></li>
              <li><Link to="/register?role=employer" className="hover:text-white transition-colors">Company Profile</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs">
          © {new Date().getFullYear()} Job Portal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
