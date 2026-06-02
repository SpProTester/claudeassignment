import { useState } from 'react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { key: 'All',          label: 'All articles' },
  { key: 'Resume',       label: 'Resume' },
  { key: 'Interview',    label: 'Interviews' },
  { key: 'Career Growth',label: 'Career Growth' },
  { key: 'Job Search',   label: 'Job Search' },
  { key: 'Salary',       label: 'Salary' },
];

const CAT_LABEL = {
  Resume:        { text: 'RESUME GUIDES',   color: 'text-teal-600' },
  Interview:     { text: 'INTERVIEWING',    color: 'text-blue-600' },
  'Career Growth': { text: 'CAREER GROWTH', color: 'text-violet-600' },
  'Job Search':  { text: 'JOB SEARCH',      color: 'text-orange-600' },
  Salary:        { text: 'SALARY GUIDES',   color: 'text-emerald-600' },
};

const ARTICLES = [
  {
    slug: 'resume-mistakes',
    category: 'Resume',
    title: '10 Resume Mistakes That Get You Rejected Instantly',
    excerpt: 'Hiring managers spend an average of 7 seconds on a resume. Here are the biggest mistakes that send yours to the trash — and how to fix them.',
    readTime: '5 min read',
    // Resume document being reviewed on a desk
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=380&fit=crop&auto=format',
    author: { name: 'Sarah Mitchell', role: 'Career Expert', avatar: 'https://i.pravatar.cc/48?img=47' },
  },
  {
    slug: 'tell-me-about-yourself',
    category: 'Interview',
    title: 'How to Answer "Tell Me About Yourself" (With Examples)',
    excerpt: 'It\'s the most common interview opener — and most candidates blow it. Learn a simple 3-part formula that leaves a great first impression.',
    readTime: '4 min read',
    // One-on-one interview across a table
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=380&fit=crop&auto=format',
    author: { name: 'James Chen', role: 'Senior Recruiter', avatar: 'https://i.pravatar.cc/48?img=12' },
  },
  {
    slug: 'salary-negotiation',
    category: 'Salary',
    title: 'How to Negotiate Your Salary Without Feeling Awkward',
    excerpt: 'Negotiating your salary can feel uncomfortable, but it\'s expected. We break down exactly what to say and when to say it.',
    readTime: '6 min read',
    // Business handshake / deal being made
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=380&fit=crop&auto=format',
    author: { name: 'Emily Rodriguez', role: 'HR Consultant', avatar: 'https://i.pravatar.cc/48?img=25' },
  },
  {
    slug: 'hidden-job-market',
    category: 'Job Search',
    title: "The Hidden Job Market: How to Find Jobs That Aren't Posted",
    excerpt: 'Up to 70% of jobs are never publicly posted. Learn how networking, LinkedIn outreach, and referrals unlock unadvertised opportunities.',
    readTime: '7 min read',
    // Professionals networking in an office
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=380&fit=crop&auto=format',
    author: { name: 'Marcus Johnson', role: 'Career Coach', avatar: 'https://i.pravatar.cc/48?img=15' },
  },
  {
    slug: 'how-to-get-promoted',
    category: 'Career Growth',
    title: 'How to Ask for a Promotion (And Actually Get It)',
    excerpt: 'Timing, framing, and data are everything. Here\'s a step-by-step guide to making your case for the next level.',
    readTime: '5 min read',
    // Confident professional presenting in a meeting
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=380&fit=crop&auto=format',
    author: { name: 'Sarah Mitchell', role: 'Career Expert', avatar: 'https://i.pravatar.cc/48?img=47' },
  },
  {
    slug: 'star-method',
    category: 'Interview',
    title: 'The STAR Method: Ace Every Behavioral Interview Question',
    excerpt: 'Situation, Task, Action, Result — master this framework and you\'ll nail questions like "Tell me about a challenge you overcame."',
    readTime: '4 min read',
    // Panel interview with multiple interviewers
    image: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=600&h=380&fit=crop&auto=format',
    author: { name: 'James Chen', role: 'Senior Recruiter', avatar: 'https://i.pravatar.cc/48?img=12' },
  },
  {
    slug: 'cover-letter',
    category: 'Resume',
    title: 'How to Write a Cover Letter That Gets Read',
    excerpt: 'Most cover letters are ignored. The ones that get read have one thing in common: they\'re tailored, specific, and short.',
    readTime: '4 min read',
    // Person writing / typing a letter at a desk
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=380&fit=crop&auto=format',
    author: { name: 'Emily Rodriguez', role: 'HR Consultant', avatar: 'https://i.pravatar.cc/48?img=25' },
  },
  {
    slug: 'career-change-90-day-plan',
    category: 'Career Growth',
    title: "Switching Careers? Here's Your 90-Day Plan",
    excerpt: 'A career change doesn\'t have to be a leap of faith. Break it into phases: research, skill-building, networking, and applying.',
    readTime: '8 min read',
    // Person planning on whiteboard / new road ahead
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=380&fit=crop&auto=format',
    author: { name: 'Priya Patel', role: 'Career Strategist', avatar: 'https://i.pravatar.cc/48?img=32' },
  },
  {
    slug: 'linkedin-optimisation',
    category: 'Job Search',
    title: 'LinkedIn Profile Optimization: The Complete 2025 Guide',
    excerpt: 'Recruiters search LinkedIn 200M times a week. Optimize your profile with the right keywords, headline, and summary to get found.',
    readTime: '6 min read',
    // Person working on laptop — digital profile
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=380&fit=crop&auto=format',
    author: { name: 'Marcus Johnson', role: 'Career Coach', avatar: 'https://i.pravatar.cc/48?img=15' },
  },
];

function ArticleCard({ article }) {
  const label = CAT_LABEL[article.category] ?? { text: article.category.toUpperCase(), color: 'text-primary-600' };

  return (
    <Link
      to={`/career-advice/${article.slug}`}
      className="group flex flex-col"
    >
      {/* Thumbnail */}
      <div className="aspect-[16/10] overflow-hidden rounded-xl mb-5 bg-gray-100">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      {/* Category label */}
      <p className={`text-xs font-bold uppercase tracking-[0.12em] mb-2 ${label.color}`}>
        {label.text}
      </p>

      {/* Title */}
      <h3 className="font-bold text-gray-900 text-lg leading-snug mb-4 group-hover:text-primary-700 transition-colors line-clamp-2">
        {article.title}
      </h3>

      {/* Author */}
      <div className="flex items-center gap-2.5 mt-auto">
        <img
          src={article.author.avatar}
          alt={article.author.name}
          className="w-8 h-8 rounded-full object-cover shrink-0 bg-gray-200"
        />
        <p className="text-sm text-gray-500 truncate">
          By <span className="font-semibold text-gray-700">{article.author.name}</span>
          <span className="text-gray-400"> , {article.author.role}</span>
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mt-5" />
    </Link>
  );
}

export default function CareerAdvice() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? ARTICLES
    : ARTICLES.filter((a) => a.category === activeCategory);

  const featured = ARTICLES[0];

  return (
    <div className="bg-white min-h-screen">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Career Advice</h1>
          <p className="text-gray-500 text-base">
            Expert tips on resumes, interviews, salary negotiation, and growing your career.
          </p>
        </div>
      </div>

      {/* ── Filter pills ──────────────────────────────────────── */}
      <div className="sticky top-16 bg-white border-b border-gray-100 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-4 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                  activeCategory === cat.key
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Featured article (visible only on "All") ─────────── */}
        {activeCategory === 'All' && (
          <Link
            to={`/career-advice/${featured.slug}`}
            className="group grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-14 pb-14 border-b border-gray-100"
          >
            <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-[0.12em] mb-3 ${CAT_LABEL[featured.category]?.color ?? 'text-primary-600'}`}>
                {CAT_LABEL[featured.category]?.text ?? featured.category}
              </p>
              <h2 className="text-3xl font-extrabold text-gray-900 leading-tight mb-4 group-hover:text-primary-700 transition-colors">
                {featured.title}
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6 text-base">
                {featured.excerpt}
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={featured.author.avatar}
                  alt={featured.author.name}
                  className="w-9 h-9 rounded-full object-cover bg-gray-200"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{featured.author.name}</p>
                  <p className="text-xs text-gray-400">{featured.author.role} · {featured.readTime}</p>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* ── Article grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
          {(activeCategory === 'All' ? ARTICLES.slice(1) : filtered).map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">No articles in this category yet.</p>
          </div>
        )}

        {/* ── CTA ──────────────────────────────────────────────── */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-10 text-center border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to put this advice to work?</h3>
          <p className="text-gray-500 text-sm mb-7">
            Browse thousands of jobs and find your next opportunity today.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
            <Link
              to="/seeker/resume"
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:border-primary-400 hover:text-primary-700 transition-colors"
            >
              Build My Resume
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
