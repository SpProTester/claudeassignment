import { Link } from 'react-router-dom';

const posts = [
  {
    slug: 'resume-writing-tips',
    icon: '📝',
    category: 'Resume',
    title: 'Resume Writing Tips',
    excerpt:
      'Craft a resume that stands out with our expert guide to formatting and keywords.',
    readTime: '6 min read',
    date: 'May 28, 2026',
  },
  {
    slug: 'ace-your-interview',
    icon: '🎯',
    category: 'Interview',
    title: 'Ace Your Interview',
    excerpt:
      'Prepare for common questions and make a lasting impression on hiring managers.',
    readTime: '7 min read',
    date: 'May 20, 2026',
  },
  {
    slug: 'career-switching-guide',
    icon: '💡',
    category: 'Career Growth',
    title: 'Career Switching Guide',
    excerpt:
      'Planning a career change? Learn how to transfer your skills to a new field.',
    readTime: '8 min read',
    date: 'May 12, 2026',
  },
  {
    slug: 'salary-negotiation',
    icon: '💰',
    category: 'Compensation',
    title: 'Salary Negotiation',
    excerpt:
      'Know your worth and negotiate confidently with our step-by-step playbook.',
    readTime: '5 min read',
    date: 'May 5, 2026',
  },
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-14 text-center">
          <span className="inline-block bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            Career Advice &amp; Resources
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Expert tips to accelerate your career
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Practical, no-fluff guides written for every stage of your job search — from first resume to final offer.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl border border-gray-100 shadow-card p-7 hover:shadow-card-hover hover:border-primary-100 transition-all duration-200 flex flex-col"
            >
              <div className="text-4xl mb-4">{post.icon}</div>
              <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-1">
                {post.category}
              </span>
              <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed flex-1">{post.excerpt}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs text-gray-400">{post.date} · {post.readTime}</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600">
                  Read article
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
