import { useState } from 'react';
import { Link } from 'react-router-dom';

const CATEGORIES = ['All', 'Resume', 'Interview', 'Career Growth', 'Job Search', 'Salary'];

const ARTICLES = [
  {
    slug: 'resume-mistakes',
    category: 'Resume',
    tag: 'Resume',
    title: '10 Resume Mistakes That Get You Rejected Instantly',
    excerpt: 'Hiring managers spend an average of 7 seconds on a resume. Here are the biggest mistakes that send yours to the trash — and how to fix them.',
    readTime: '5 min read',
    icon: '📄',
  },
  {
    slug: 'tell-me-about-yourself',
    category: 'Interview',
    tag: 'Interview',
    title: 'How to Answer "Tell Me About Yourself" (With Examples)',
    excerpt: 'It\'s the most common interview opener — and most candidates blow it. Learn a simple 3-part formula that leaves a great first impression.',
    readTime: '4 min read',
    icon: '🎤',
  },
  {
    slug: 'salary-negotiation',
    category: 'Salary',
    tag: 'Salary',
    title: 'How to Negotiate Your Salary Without Feeling Awkward',
    excerpt: 'Negotiating your salary can feel uncomfortable, but it\'s expected. We break down exactly what to say and when to say it.',
    readTime: '6 min read',
    icon: '💰',
  },
  {
    slug: 'hidden-job-market',
    category: 'Job Search',
    tag: 'Job Search',
    title: 'The Hidden Job Market: How to Find Jobs That Aren\'t Posted',
    excerpt: 'Up to 70% of jobs are never publicly posted. Learn how networking, LinkedIn outreach, and referrals unlock unadvertised opportunities.',
    readTime: '7 min read',
    icon: '🔍',
  },
  {
    slug: 'how-to-get-promoted',
    category: 'Career Growth',
    tag: 'Career Growth',
    title: 'How to Ask for a Promotion (And Actually Get It)',
    excerpt: 'Timing, framing, and data are everything. Here\'s a step-by-step guide to making your case for the next level.',
    readTime: '5 min read',
    icon: '🚀',
  },
  {
    slug: 'star-method',
    category: 'Interview',
    tag: 'Interview',
    title: 'The STAR Method: Ace Every Behavioral Interview Question',
    excerpt: 'Situation, Task, Action, Result — master this framework and you\'ll nail questions like "Tell me about a challenge you overcame."',
    readTime: '4 min read',
    icon: '⭐',
  },
  {
    slug: 'cover-letter',
    category: 'Resume',
    tag: 'Resume',
    title: 'How to Write a Cover Letter That Gets Read',
    excerpt: 'Most cover letters are ignored. The ones that get read have one thing in common: they\'re tailored, specific, and short.',
    readTime: '4 min read',
    icon: '✉️',
  },
  {
    slug: 'career-change-90-day-plan',
    category: 'Career Growth',
    tag: 'Career Growth',
    title: 'Switching Careers? Here\'s Your 90-Day Plan',
    excerpt: 'A career change doesn\'t have to be a leap of faith. Break it into phases: research, skill-building, networking, and applying.',
    readTime: '8 min read',
    icon: '🔄',
  },
  {
    slug: 'linkedin-optimisation',
    category: 'Job Search',
    tag: 'Job Search',
    title: 'LinkedIn Profile Optimization: The Complete 2025 Guide',
    excerpt: 'Recruiters search LinkedIn 200M times a week. Optimize your profile with the right keywords, headline, and summary to get found.',
    readTime: '6 min read',
    icon: '🔗',
  },
];

export default function CareerAdvice() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? ARTICLES
    : ARTICLES.filter((a) => a.category === activeCategory);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4">Career Advice</h1>
          <p className="text-primary-200 text-lg max-w-2xl mx-auto">
            Expert tips on resumes, interviews, salary negotiation, and growing your career — all in one place.
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="border-b border-gray-100 sticky top-16 bg-white z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-3 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((article, i) => (
            <Link
              key={i}
              to={`/career-advice/${article.slug}`}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-200 overflow-hidden group"
            >
              <div className="bg-primary-50 p-6 flex items-center justify-center text-5xl">
                {article.icon}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block bg-primary-50 text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {article.tag}
                  </span>
                  <span className="text-xs text-gray-400">{article.readTime}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 group-hover:text-primary-700 transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary-600">
                  Read article
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-primary-50 rounded-2xl p-8 text-center border border-primary-100">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to put this advice to work?</h3>
          <p className="text-gray-600 text-sm mb-6">Browse thousands of jobs and find your next opportunity today.</p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/jobs" className="btn-primary">
              Browse Jobs
            </Link>
            <Link to="/seeker/resume" className="px-5 py-2.5 rounded-xl border border-primary-200 text-primary-700 font-semibold text-sm hover:bg-primary-100 transition-colors">
              Build My Resume
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
