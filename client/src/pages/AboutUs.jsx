import { Link } from 'react-router-dom';

export default function AboutUs() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">About WorkHunt</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            We're on a mission to connect talented professionals with the companies they'll love — making the job search simple, transparent, and human.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">

        {/* Mission */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            WorkHunt was founded with a simple belief: finding the right job shouldn't be hard. We built a platform that puts people first — giving job seekers the tools they need to present their best selves, and giving employers the reach to find exceptional talent.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Whether you're looking for your first role or your next big opportunity, WorkHunt is designed to get you there faster.
          </p>
        </section>

        {/* Stats */}
        <section className="grid sm:grid-cols-3 gap-6">
          {[
            { value: '50,000+', label: 'Active Job Listings' },
            { value: '2M+',     label: 'Job Seekers' },
            { value: '10,000+', label: 'Companies Hiring' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <p className="text-3xl font-extrabold text-primary-600 mb-1">{value}</p>
              <p className="text-sm text-gray-500 font-medium">{label}</p>
            </div>
          ))}
        </section>

        {/* Values */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Values</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: '🤝', title: 'Trust',        desc: 'We verify employers and protect seeker data so every interaction is safe.' },
              { icon: '⚡', title: 'Speed',        desc: 'From search to application in minutes — no unnecessary friction.' },
              { icon: '🎯', title: 'Relevance',    desc: 'Smart matching surfaces jobs that actually fit your skills and goals.' },
              { icon: '🌍', title: 'Inclusion',    desc: 'Opportunities for everyone, regardless of background or location.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <span className="text-2xl shrink-0">{icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Ready to find your next role?</h2>
          <p className="text-gray-500 text-sm mb-6">Join millions of professionals already using WorkHunt.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/jobs"     className="btn-primary px-6 py-3">Browse Jobs</Link>
            <Link to="/register" className="btn-outline px-6 py-3">Create Free Account</Link>
          </div>
        </section>

      </div>
    </div>
  );
}
