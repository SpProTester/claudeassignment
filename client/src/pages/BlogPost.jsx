import { useParams, Link, Navigate } from 'react-router-dom';

const posts = {
  'resume-writing-tips': {
    icon: '📝',
    category: 'Resume',
    title: 'Resume Writing Tips',
    date: 'May 28, 2026',
    readTime: '6 min read',
    content: [
      {
        type: 'intro',
        text: `Your resume is your first impression — and in most hiring pipelines it gets less than 10 seconds of attention before a recruiter decides whether to keep reading. That gap between "rejected" and "interview scheduled" almost always comes down to clarity, relevance, and formatting.`,
      },
      {
        type: 'section',
        heading: '1. Lead with a strong summary',
        text: `Replace the old-fashioned "Objective" section with a 2–3 sentence professional summary. State your role, your years of experience, and the single most impressive thing you've accomplished. Think of it as your elevator pitch in text form.`,
        tip: 'Example: "Full-stack engineer with 4 years building fintech products at scale. Led the API migration that cut latency by 40% and unblocked a $2M enterprise deal."',
      },
      {
        type: 'section',
        heading: "2. Mirror the job description's language",
        text: `Most companies use Applicant Tracking Systems (ATS) that scan for keywords before a human ever reads your resume. Read the job posting carefully and reflect its exact phrasing — if they say "cross-functional collaboration," use those words, not "teamwork."`,
      },
      {
        type: 'section',
        heading: '3. Quantify everything you can',
        text: `Numbers make achievements credible and memorable. Instead of "Improved sales process," write "Reduced average sales cycle from 45 to 28 days, contributing to a 22% increase in quarterly revenue." Even rough estimates ("managed a budget of ~$50K") are better than vague descriptions.`,
      },
      {
        type: 'section',
        heading: '4. Keep it to one page (mostly)',
        text: `Unless you have 10+ years of directly relevant experience, one page is the standard. Hiring managers don't want a career autobiography — they want to quickly confirm you can do the job. Ruthlessly cut older roles, hobby projects, and skills that aren't relevant to the position.`,
      },
      {
        type: 'section',
        heading: '5. Use a clean, scannable format',
        text: `Stick to a single font (Inter, Calibri, or Garamond all work well), consistent heading sizes, and generous white space. Use bullet points, not paragraphs. Avoid tables or text boxes — ATS systems frequently misread them.`,
        tip: 'Avoid: photos, graphics, headers/footers, and fancy columns. Simple PDF is the safest export format.',
      },
      {
        type: 'section',
        heading: '6. Tailor every application',
        text: `A single generic resume for 50 jobs is less effective than 10 tailored resumes for 10 jobs. Spend 15 minutes per application adjusting your summary and bullet points to match the specific role. This single habit has the highest ROI of any resume advice.`,
      },
      {
        type: 'closing',
        text: `A great resume doesn't get you the job — it gets you the interview. Focus on making it crystal clear that you've done this exact type of work before and done it well. The rest is up to you in the room.`,
      },
    ],
  },
  'ace-your-interview': {
    icon: '🎯',
    category: 'Interview',
    title: 'Ace Your Interview',
    date: 'May 20, 2026',
    readTime: '7 min read',
    content: [
      {
        type: 'intro',
        text: `Interviews aren't tests of raw intelligence — they're structured conversations designed to answer one question: "Can this person do the job and will they make the team better?" Almost everything you do before, during, and after the interview affects that answer.`,
      },
      {
        type: 'section',
        heading: '1. Research the company, not just the role',
        text: `Read the company's website, recent press releases, LinkedIn posts, and reviews on Glassdoor. Know their product, their customers, their competitors, and their recent milestones. Interviewers can immediately tell who prepared and who didn't — and they hire the ones who did.`,
        tip: 'Try to find out who will be interviewing you and read their LinkedIn before the call.',
      },
      {
        type: 'section',
        heading: '2. Master the STAR method',
        text: `Most behavioral questions ("Tell me about a time you...") are best answered with the STAR format: Situation (context), Task (what you were responsible for), Action (what you specifically did), Result (measurable outcome). Practice this out loud — it sounds very different in your head vs. spoken aloud.`,
      },
      {
        type: 'section',
        heading: '3. Prepare five core stories',
        text: `Before any interview, prepare 5 versatile stories from your work history: one about overcoming a challenge, one about working with a difficult person, one about leading or influencing others, one about a failure and what you learned, and one about your biggest impact. These cover 80% of behavioral questions.`,
      },
      {
        type: 'section',
        heading: '4. Handle technical rounds differently',
        text: `For technical interviews, thinking out loud is more important than getting the right answer immediately. Walk the interviewer through your reasoning, ask clarifying questions, and explain the tradeoffs of each approach. A candidate who communicates well while solving a problem is more appealing than one who silently arrives at a solution.`,
      },
      {
        type: 'section',
        heading: '5. Ask genuinely curious questions',
        text: `"Do you have any questions for us?" is not a formality — it's part of the evaluation. Ask about the team's current biggest challenge, what success looks like in the first 90 days, or how the interviewer's own career has developed at the company. These questions signal maturity and genuine interest.`,
        tip: 'Avoid questions about salary, vacation, or remote work in early rounds — they signal misplaced priorities.',
      },
      {
        type: 'section',
        heading: '6. Send a follow-up within 24 hours',
        text: `A short, specific thank-you email makes a real difference, especially for competitive roles. Reference something specific from the conversation to prove you were engaged. Keep it to 3–4 sentences. Most candidates don't bother — this alone sets you apart.`,
      },
      {
        type: 'closing',
        text: `Confidence in an interview comes from preparation, not luck. The candidates who do best aren't the most naturally charming — they're the ones who put in the hours before the call. Give yourself that edge.`,
      },
    ],
  },
  'career-switching-guide': {
    icon: '💡',
    category: 'Career Growth',
    title: 'Career Switching Guide',
    date: 'May 12, 2026',
    readTime: '8 min read',
    content: [
      {
        type: 'intro',
        text: `Changing careers is one of the most daunting professional decisions — and also one of the most common. Studies suggest the average person changes careers (not just jobs) 3–7 times in their working life. The difference between a successful switch and a frustrating one almost always comes down to strategy, not opportunity.`,
      },
      {
        type: 'section',
        heading: '1. Identify the transferable skills you already have',
        text: `Before you look outward at a new field, do an honest inventory of what you bring. Project management, communication, data analysis, customer empathy, problem-solving under pressure — these transfer across almost every industry. List yours explicitly; they're your bridge.`,
        tip: "Use the O*NET skills database to map your current role's skills to skills required in your target role.",
      },
      {
        type: 'section',
        heading: '2. Validate the field before committing',
        text: `Talk to 10 people in the target role before you spend a dollar on courses or certifications. Informational interviews are free, surprisingly easy to arrange (most people are happy to share their experience), and will give you ground truth about day-to-day reality that job postings never reveal. You may find the grass is greener — or you may find it's a mirage.`,
      },
      {
        type: 'section',
        heading: '3. Build a "proof of work" bridge portfolio',
        text: `Employers in a new field can't see your track record, so you need to create visible evidence of your new capabilities. Take on freelance projects, contribute to open-source, write publicly about what you're learning, or build something small and ship it. A junior candidate with a portfolio of real work will consistently beat a senior candidate with a certificate.`,
      },
      {
        type: 'section',
        heading: '4. Plan for a temporary income dip',
        text: `Most career switchers take a pay cut in the short term — plan for it. Build a financial runway of 6–12 months if possible before making the jump. This removes desperation from your negotiations and lets you hold out for the right role rather than accepting the first offer just to end the uncertainty.`,
      },
      {
        type: 'section',
        heading: '5. Target companies that value diverse backgrounds',
        text: `Startups, growth-stage companies, and cross-functional teams often actively prefer candidates who bring outside perspective. A former teacher who becomes a product manager often brings stronger empathy and communication skills than a PM who came up through the usual path. Frame your unique background as a feature, not a bug.`,
      },
      {
        type: 'section',
        heading: '6. Update your narrative — your resume and your story',
        text: `Your resume needs a new narrative arc. Lead with a functional or hybrid format that leads with skills and accomplishments, not a chronological list of titles in a different field. More importantly, practice your verbal story: "I've spent 7 years in X, and what I loved most — [specific thing] — maps directly to what this role needs because..."`,
        tip: 'LinkedIn is as important as your resume for a career switch. Rewrite your headline and About section to reflect where you\'re going, not where you\'ve been.',
      },
      {
        type: 'closing',
        text: `A career switch is not starting over — it's compounding. Everything you know is still with you. The goal is to connect your past to your future in a way that's compelling to employers. With patience, strategy, and genuine effort to build new skills, the switch is almost always possible.`,
      },
    ],
  },
  'salary-negotiation': {
    icon: '💰',
    category: 'Compensation',
    title: 'Salary Negotiation',
    date: 'May 5, 2026',
    readTime: '5 min read',
    content: [
      {
        type: 'intro',
        text: `Most people leave significant money on the table simply by not negotiating. Studies consistently show that employers almost always expect candidates to negotiate, and the first offer is rarely the best one. Yet fewer than 40% of candidates ever counter. That gap is your opportunity.`,
      },
      {
        type: 'section',
        heading: '1. Do your market research first',
        text: `Salary negotiation starts long before the offer call. Research compensation data on Levels.fyi (for tech), Glassdoor, LinkedIn Salary, and industry salary surveys. Know the 25th, 50th, and 75th percentile for your exact role, level, and location. Walk into the negotiation with data, not feelings.`,
        tip: 'Also research the company specifically — a seed-stage startup and a Fortune 500 have very different salary bands, and knowing which you\'re dealing with sets realistic expectations.',
      },
      {
        type: 'section',
        heading: '2. Let them make the first offer',
        text: `Whoever names a number first is at a disadvantage. When asked "What are your salary expectations?", deflect with: "I'm flexible and would love to understand the full compensation package and budget for this role first." This is completely acceptable and experienced recruiters expect it.`,
      },
      {
        type: 'section',
        heading: '3. Anchor high, but reasonably',
        text: `When you do counter, anchor 10–20% above your target number. This gives you room to "meet in the middle" at exactly where you wanted to be. Frame your counter around market data: "Based on my research and the scope of this role, I was expecting something in the range of $X–$Y."`,
      },
      {
        type: 'section',
        heading: '4. Negotiate the whole package',
        text: `Base salary is just one lever. Signing bonus, equity, remote work flexibility, vacation days, professional development budget, and start date are all negotiable. If they can't move on salary, try the bonus or an earlier review. A well-negotiated package can be worth 20–40% more than the base salary alone.`,
        tip: 'Get any verbal commitments in writing before you sign — promises about future raises or promotions are not binding unless documented.',
      },
      {
        type: 'section',
        heading: '5. Handle the pressure to decide immediately',
        text: `"We need an answer by end of day" is almost always a pressure tactic, not a hard deadline. It's perfectly professional to say: "I'm very excited about this opportunity. Could I have until [specific date — 48–72 hours] to review the full offer?" A company that rescinds an offer because you asked for 48 hours is a company with a culture problem.`,
      },
      {
        type: 'section',
        heading: '6. Practice saying the number out loud',
        text: `Most people are uncomfortable stating a large number without hedging or apologizing. Practice saying your target number confidently and then stopping — silence is powerful in negotiations. "I was expecting $X" followed by silence puts the ball in their court without the unnecessary "but I'm flexible" that undercuts your position.`,
      },
      {
        type: 'closing',
        text: `Negotiating is not confrontational — it's professional. Recruiters negotiate salaries every day; it doesn't surprise or offend them. The only thing that stands between you and a better offer is the willingness to ask. The worst they can say is no — and you end up exactly where you started.`,
      },
    ],
  },
};

function ContentBlock({ block }) {
  if (block.type === 'intro' || block.type === 'closing') {
    return (
      <p className={`text-gray-600 leading-relaxed text-base ${block.type === 'intro' ? 'text-lg font-light' : 'italic'}`}>
        {block.text}
      </p>
    );
  }
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">{block.heading}</h2>
      <p className="text-gray-600 leading-relaxed">{block.text}</p>
      {block.tip && (
        <div className="mt-3 bg-primary-50 border-l-4 border-primary-400 rounded-r-xl px-4 py-3 text-sm text-primary-800">
          <span className="font-semibold">Tip: </span>{block.tip}
        </div>
      )}
    </div>
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = posts[slug];

  if (!post) return <Navigate to="/blog" replace />;

  const slugs = Object.keys(posts);
  const currentIndex = slugs.indexOf(slug);
  const prevSlug = slugs[currentIndex - 1] ?? null;
  const nextSlug = slugs[currentIndex + 1] ?? null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:underline"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Career Advice &amp; Resources
          </Link>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 mb-8">
          <div className="text-5xl mb-5">{post.icon}</div>
          <span className="inline-block bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
            {post.category}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{post.title}</h1>
          <p className="text-sm text-gray-400">{post.date} · {post.readTime}</p>
        </div>

        {/* Body */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 space-y-6">
          {post.content.map((block, i) => (
            <ContentBlock key={i} block={block} />
          ))}
        </div>

        {/* Prev / Next */}
        <div className="mt-10 grid grid-cols-2 gap-4">
          {prevSlug ? (
            <Link
              to={`/blog/${prevSlug}`}
              className="group bg-white rounded-2xl border border-gray-100 shadow-card p-5 hover:border-primary-100 hover:shadow-card-hover transition-all"
            >
              <div className="text-xs text-gray-400 mb-1">← Previous</div>
              <div className="font-semibold text-gray-900 group-hover:text-primary-600 text-sm transition-colors">
                {posts[prevSlug].title}
              </div>
            </Link>
          ) : <div />}

          {nextSlug ? (
            <Link
              to={`/blog/${nextSlug}`}
              className="group bg-white rounded-2xl border border-gray-100 shadow-card p-5 hover:border-primary-100 hover:shadow-card-hover transition-all text-right"
            >
              <div className="text-xs text-gray-400 mb-1">Next →</div>
              <div className="font-semibold text-gray-900 group-hover:text-primary-600 text-sm transition-colors">
                {posts[nextSlug].title}
              </div>
            </Link>
          ) : <div />}
        </div>
      </article>
    </div>
  );
}
