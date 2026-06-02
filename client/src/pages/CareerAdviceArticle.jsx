import { useParams, Link, Navigate } from 'react-router-dom';

const CAT_LABEL = {
  Resume:          { text: 'RESUME GUIDES',   color: 'text-teal-600' },
  Interview:       { text: 'INTERVIEWING',    color: 'text-blue-600' },
  'Career Growth': { text: 'CAREER GROWTH',   color: 'text-violet-600' },
  'Job Search':    { text: 'JOB SEARCH',      color: 'text-orange-600' },
  Salary:          { text: 'SALARY GUIDES',   color: 'text-emerald-600' },
};

const ARTICLES = [
  {
    slug: 'resume-mistakes',
    category: 'Resume',
    title: '10 Resume Mistakes That Get You Rejected Instantly',
    readTime: '5 min read',
    image: 'https://picsum.photos/seed/resume-laptop/1200/500',
    author: { name: 'Sarah Mitchell', role: 'Career Expert', avatar: 'https://i.pravatar.cc/48?img=47' },
    body: [
      {
        heading: 'Why your resume gets 7 seconds',
        text: 'Recruiters are overwhelmed. With hundreds of applications per role, they scan — they do not read. If your resume does not pass the 7-second glance test, it goes straight to the reject pile. That means formatting, clarity, and positioning matter more than ever.',
      },
      {
        heading: '1. Using an outdated format',
        text: 'Avoid tables, text boxes, headers, and footers. Applicant Tracking Systems (ATS) cannot parse these correctly and your resume may appear blank to the software that scores it. Use a clean, single-column layout with standard section headings.',
      },
      {
        heading: '2. Writing job descriptions instead of achievements',
        text: 'Listing your duties is not the same as proving your value. Replace "responsible for managing social media" with "grew Instagram following by 42% in 6 months through a weekly content calendar." Quantify everything you can.',
      },
      {
        heading: '3. Using a generic objective statement',
        text: '"Looking for a challenging role in a dynamic organisation" says nothing. Replace the objective with a 2–3 line professional summary that names your specialisation, years of experience, and one impressive result.',
      },
      {
        heading: '4. Burying your most relevant experience',
        text: 'Most recent experience goes first, but if an older role is more relevant to the job you are applying for, find a way to surface it — through your summary, a "Key Achievements" section, or a skills block at the top.',
      },
      {
        heading: '5. Ignoring keywords from the job description',
        text: 'ATS systems score your resume against the job posting. Read the description carefully and mirror the exact language used — especially for technical skills, tools, and credentials.',
      },
      {
        heading: '6. Making it too long (or too short)',
        text: 'One page for under 5 years of experience. Two pages for more. Three pages is almost never justified. If it does not fit, cut scope creep — not achievements.',
      },
      {
        heading: '7. Typos and inconsistent formatting',
        text: 'A single typo signals carelessness. Spellcheck is not enough — read it out loud, then ask someone else to read it. Also ensure consistent font sizes, bullet styles, and date formats throughout.',
      },
      {
        heading: '8. Including irrelevant personal information',
        text: 'Leave off your photo, age, marital status, religion, and hobbies — unless directly relevant. These add no value and can trigger unconscious bias.',
      },
      {
        heading: '9. Not tailoring for each application',
        text: 'A resume sent to 50 companies without modification is a template, not an application. Spend 10 minutes customising the summary and skills section for each role. Targeted resumes get 3× more callbacks.',
      },
      {
        heading: '10. Saving it in the wrong format',
        text: 'Unless instructed otherwise, always submit as a PDF. Word documents reformat on different machines. PDFs look exactly as intended on every screen.',
      },
    ],
  },
  {
    slug: 'tell-me-about-yourself',
    category: 'Interview',
    title: 'How to Answer "Tell Me About Yourself" (With Examples)',
    readTime: '4 min read',
    image: 'https://picsum.photos/seed/interview-meeting/1200/500',
    author: { name: 'James Chen', role: 'Senior Recruiter', avatar: 'https://i.pravatar.cc/48?img=12' },
    body: [
      {
        heading: 'Why this question trips people up',
        text: 'It sounds simple, but most candidates ramble through their life story or recite their CV word for word. The interviewer already has your resume — they want to hear you synthesise it into a compelling, confident narrative.',
      },
      {
        heading: 'The 3-part Present–Past–Future formula',
        text: 'The cleanest structure is: (1) Where you are now — your current role and what you do. (2) How you got here — 1–2 relevant career highlights or transitions. (3) Why you are here — what excites you about this specific role and company.',
      },
      {
        heading: 'Example: Software Engineer',
        text: '"I am a full-stack engineer with 4 years of experience, currently at a fintech startup where I lead the backend team building real-time payment APIs. Before that I was at a digital agency where I honed my skills across Node, React, and cloud infrastructure. I am looking to move into a product company where I can have more ownership over architecture decisions — which is exactly what drew me to this role."',
      },
      {
        heading: 'Example: Recent Graduate',
        text: '"I recently graduated with a degree in Marketing, with a focus on data analytics. During my studies I ran social media for a student-led nonprofit that grew from 800 to 12,000 followers in a year. I also completed an internship at a B2B SaaS company where I supported campaign reporting. I am now looking for a full-time role where I can grow my paid-media skills in a structured team."',
      },
      {
        heading: 'Tips to deliver it well',
        text: 'Keep it to 60–90 seconds. Practise until it feels natural — not memorised. Make eye contact. End on a forward-looking note that references the company you are interviewing with. Never start with "So, I was born in..." — skip the backstory.',
      },
    ],
  },
  {
    slug: 'salary-negotiation',
    category: 'Salary',
    title: 'How to Negotiate Your Salary Without Feeling Awkward',
    readTime: '6 min read',
    image: 'https://picsum.photos/seed/salary-negotiation/1200/500',
    author: { name: 'Emily Rodriguez', role: 'HR Consultant', avatar: 'https://i.pravatar.cc/48?img=25' },
    body: [
      {
        heading: 'Negotiation is expected',
        text: 'A survey by Salary.com found that 84% of employers expect candidates to negotiate. Yet only 37% of workers always negotiate. That gap costs people thousands per year — and it compounds over a career. Negotiating is professional, not pushy.',
      },
      {
        heading: 'Do your research first',
        text: 'Use tools like Glassdoor, LinkedIn Salary, and our Salary Tools page to benchmark the role. Know the range before the conversation so you can anchor confidently. Going in blind means you might aim too low — or too high and lose the offer.',
      },
      {
        heading: 'Never give the first number',
        text: 'When asked "What are your salary expectations?" try to deflect: "I\'d love to understand the full scope of the role first — what is the budgeted range for this position?" If they press, say "Based on my research and experience, I would expect something in the range of X–Y."',
      },
      {
        heading: 'Anchor 10–20% above your target',
        text: 'Negotiation is a conversation, not a demand. If your target is £60,000, open at £68,000. This gives you room to "come down" while still hitting your goal. Anchoring too low leaves money on the table; too high signals a mismatch.',
      },
      {
        heading: 'Negotiate the full package',
        text: 'If base salary is fixed, negotiate other terms: signing bonus, annual bonus, extra PTO, remote-work flexibility, early salary review, or a title upgrade. A signing bonus is often easier for companies to flex on than ongoing base salary.',
      },
      {
        heading: 'The exact phrase to use',
        text: 'After receiving an offer: "Thank you — I am genuinely excited about this role. Based on my research and the experience I bring, I was hoping we could get to [number]. Is there flexibility there?" Then stop talking. Silence is powerful.',
      },
    ],
  },
  {
    slug: 'hidden-job-market',
    category: 'Job Search',
    title: "The Hidden Job Market: How to Find Jobs That Aren't Posted",
    readTime: '7 min read',
    image: 'https://picsum.photos/seed/networking-office/1200/500',
    author: { name: 'Marcus Johnson', role: 'Career Coach', avatar: 'https://i.pravatar.cc/48?img=15' },
    body: [
      {
        heading: 'What is the hidden job market?',
        text: 'Industry estimates suggest that 50–70% of roles are filled without ever being publicly advertised. Companies promote internally, hire via referrals, or reach out to passive candidates before posting. If you only apply to job boards, you are competing for a fraction of the available roles.',
      },
      {
        heading: '1. Build a target company list',
        text: 'Identify 20–30 companies you would genuinely love to work for. Follow them on LinkedIn, set Google Alerts for their name, and watch for signals of growth — funding rounds, new product launches, leadership changes — that suggest hiring is coming.',
      },
      {
        heading: '2. Reach out to people, not job postings',
        text: 'Send short, specific LinkedIn messages to people in roles similar to the one you want. Ask for a 20-minute informational call — not a job. "I am exploring a transition into [field] and your career path caught my eye. Would you have 20 minutes to share your experience?" 30% of well-crafted messages get a reply.',
      },
      {
        heading: '3. Get referred',
        text: 'Referred candidates are 4× more likely to get hired and move through the process 50% faster. Tell everyone in your network you are looking. Be specific: "I am looking for a Senior Product role in fintech in London — do you know anyone at Monzo, Revolut, or Wise?"',
      },
      {
        heading: '4. Engage with recruiters',
        text: 'In-house and agency recruiters often know about roles weeks before they are posted. Connect with them on LinkedIn, engage with their content, and send a brief, personalised message about what you are looking for.',
      },
      {
        heading: '5. Attend industry events',
        text: 'Meetups, conferences, and webinars put you in front of decision-makers in a low-pressure setting. Follow up within 24 hours with a personalised LinkedIn connection request referencing something specific from your conversation.',
      },
    ],
  },
  {
    slug: 'how-to-get-promoted',
    category: 'Career Growth',
    title: 'How to Ask for a Promotion (And Actually Get It)',
    readTime: '5 min read',
    image: 'https://picsum.photos/seed/career-growth/1200/500',
    author: { name: 'Sarah Mitchell', role: 'Career Expert', avatar: 'https://i.pravatar.cc/48?img=47' },
    body: [
      {
        heading: 'Do the job before you get the title',
        text: 'The most common mistake is asking for a promotion before demonstrating you can do the work. Spend 3–6 months operating at the next level — taking on bigger projects, mentoring junior colleagues, driving initiatives — before making the ask.',
      },
      {
        heading: 'Build a case with data',
        text: 'Collect evidence: projects delivered, revenue generated, costs saved, processes improved, people developed. Frame everything in terms of impact on the business. Vague claims like "I have been working really hard" do not move the needle.',
      },
      {
        heading: 'Have the conversation early',
        text: 'Do not spring a promotion request in a regular 1:1. Ask your manager for a dedicated conversation: "I\'d love to discuss my career progression and what the path to [next level] looks like. Can we schedule time for that?" This gives them time to prepare and signals seriousness.',
      },
      {
        heading: 'Name what you want, specifically',
        text: 'Be direct: "I\'d like to make the case for a promotion to Senior [Role] and the salary adjustment that reflects that level." Vague conversations lead to vague outcomes.',
      },
      {
        heading: 'Agree on a clear timeline',
        text: 'If the answer is not an immediate yes, ask "What would I need to demonstrate over the next 90 days for you to feel confident in recommending me?" Get that in writing — or at least follow up with an email summarising what was agreed.',
      },
    ],
  },
  {
    slug: 'star-method',
    category: 'Interview',
    title: 'The STAR Method: Ace Every Behavioral Interview Question',
    readTime: '4 min read',
    image: 'https://picsum.photos/seed/interview-panel/1200/500',
    author: { name: 'James Chen', role: 'Senior Recruiter', avatar: 'https://i.pravatar.cc/48?img=12' },
    body: [
      {
        heading: 'What is STAR?',
        text: 'STAR stands for Situation, Task, Action, Result. It is the gold-standard framework for answering behavioural interview questions — the ones that start with "Tell me about a time when..." or "Give me an example of...".',
      },
      {
        heading: 'Situation',
        text: 'Set the scene briefly. Who, what, when, where. Keep this to 1–2 sentences. The interviewer needs just enough context to understand what follows. Do not over-explain.',
      },
      {
        heading: 'Task',
        text: 'What was your specific responsibility or challenge? What were you expected to do? This distinguishes your individual role from the team\'s role.',
      },
      {
        heading: 'Action',
        text: 'This is the most important part — and where most people underdeliver. Describe exactly what YOU did, step by step. Use "I", not "we". Be specific about your reasoning and your decisions.',
      },
      {
        heading: 'Result',
        text: 'What was the outcome? Quantify it where possible: "We reduced churn by 18%", "I delivered the project 2 weeks early", "The team grew from 3 to 9 people within a year". Always end on the result — do not trail off.',
      },
      {
        heading: 'Prepare 5–7 stories before every interview',
        text: 'Have a bank of versatile stories ready: a challenge you overcame, a conflict you resolved, a project you led, a failure you learned from, a time you influenced without authority. With 5–7 stories you can answer almost any behavioural question by adjusting the framing.',
      },
    ],
  },
  {
    slug: 'cover-letter',
    category: 'Resume',
    title: 'How to Write a Cover Letter That Gets Read',
    readTime: '4 min read',
    image: 'https://picsum.photos/seed/cover-letter-desk/1200/500',
    author: { name: 'Emily Rodriguez', role: 'HR Consultant', avatar: 'https://i.pravatar.cc/48?img=25' },
    body: [
      {
        heading: 'Most cover letters are skipped',
        text: 'Research shows that most recruiters skip cover letters entirely — unless the role explicitly requires one, or you are applying for a senior or creative position. When it does get read, it is usually to assess writing ability and genuine interest.',
      },
      {
        heading: 'The opening line is everything',
        text: 'Never open with "I am writing to apply for the position of X." Everyone does this. Instead, open with your strongest card: "I have spent the last 3 years building growth systems for B2B SaaS companies, and when I saw this role at Acme I stopped scrolling."',
      },
      {
        heading: 'One page. Always.',
        text: 'A cover letter should fit on one page — ideally 3–4 short paragraphs. Paragraph 1: hook. Paragraph 2: why you are the right fit (specific evidence). Paragraph 3: why this company specifically. Paragraph 4: call to action.',
      },
      {
        heading: 'Research the company and name something specific',
        text: 'Generic praise ("I am impressed by your innovative culture") is transparent and forgettable. Mention a specific product, campaign, press release, or company initiative that genuinely interests you. This signals you did your homework.',
      },
      {
        heading: 'End with confidence, not pleading',
        text: '"I would love to chat" is weak. End with: "I would welcome the opportunity to discuss how my background maps to your team\'s goals — happy to connect at your convenience." Confident and professional.',
      },
    ],
  },
  {
    slug: 'career-change-90-day-plan',
    category: 'Career Growth',
    title: "Switching Careers? Here's Your 90-Day Plan",
    readTime: '8 min read',
    image: 'https://picsum.photos/seed/career-change/1200/500',
    author: { name: 'Priya Patel', role: 'Career Strategist', avatar: 'https://i.pravatar.cc/48?img=32' },
    body: [
      {
        heading: 'Why most career changes stall',
        text: 'People try to change careers the same way they job hunt within their field — by applying to roles. Without the right experience or network in the new field, those applications go nowhere. A structured approach makes the difference.',
      },
      {
        heading: 'Days 1–30: Research and clarity',
        text: 'Before anything else, get specific. "I want to work in tech" is not a plan. "I want to move into product management at a mid-size B2B SaaS company in London within 12 months" is. Spend the first month doing informational interviews with people in your target role. Ask what skills matter most, what the typical path looks like, and what they wish they had known.',
      },
      {
        heading: 'Days 31–60: Targeted skill-building',
        text: 'Based on your research, identify the 2–3 skills or credentials most valued in your target field. Take one focused course, complete a portfolio project, or earn a relevant certification. Breadth is less important than demonstrating depth in the most critical areas.',
      },
      {
        heading: 'Days 61–90: Network and apply',
        text: 'Start applying — but do not spray and pray. Target 10–15 companies where you have a genuine connection or strong alignment. Reach out to people before you apply. A referral from inside the company changes the odds dramatically.',
      },
      {
        heading: 'Bridge roles and side projects',
        text: 'You may not land your dream role on day 91. A bridge role — one that is adjacent to your target — can be a smart stepping stone. A product operations role, for example, is a well-trodden path into product management. Do not let perfect be the enemy of progress.',
      },
    ],
  },
  {
    slug: 'linkedin-optimisation',
    category: 'Job Search',
    title: 'LinkedIn Profile Optimisation: The Complete 2025 Guide',
    readTime: '6 min read',
    image: 'https://picsum.photos/seed/linkedin-laptop/1200/500',
    author: { name: 'Marcus Johnson', role: 'Career Coach', avatar: 'https://i.pravatar.cc/48?img=15' },
    body: [
      {
        heading: 'Why LinkedIn matters more than ever',
        text: 'LinkedIn has over 1 billion members and 65 million companies. Recruiters perform over 200 million searches per week. If your profile is not optimised, you are invisible to passive outreach — which is often where the best opportunities come from.',
      },
      {
        heading: 'Your headline is your hook',
        text: 'Most people use their job title. That is a wasted opportunity. Instead, pack your headline with keywords: "Senior Full-Stack Engineer | React · Node.js · AWS | Helping teams ship faster" is far more powerful than "Software Engineer at Acme Corp".',
      },
      {
        heading: 'The About section: first 2 lines matter most',
        text: 'LinkedIn collapses the About section after the first 2–3 lines. Make those lines count. Start with your strongest statement, not your name or job title. Hook the reader so they click "see more".',
      },
      {
        heading: 'Turn on "Open to Work" (selectively)',
        text: 'You can choose to show the green "Open to Work" banner publicly or restrict visibility to recruiters only. If you are in an active job search and not worried about your employer seeing, go public — it increases recruiter messages significantly.',
      },
      {
        heading: 'Add the right skills — in the right order',
        text: 'LinkedIn lets you pin your top 3 skills. Make sure these match the most important skills in your target job descriptions. Skills endorsements from colleagues add credibility.',
      },
      {
        heading: 'Post or engage consistently',
        text: 'You do not need to go viral. Commenting thoughtfully on posts in your field once a day increases your profile views measurably. Recruiters often check who has been engaging in their network before reaching out.',
      },
    ],
  },
];

export default function CareerAdviceArticle() {
  const { slug } = useParams();
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) return <Navigate to="/career-advice" replace />;

  const related = ARTICLES.filter((a) => a.slug !== slug && a.category === article.category).slice(0, 2);
  const label = CAT_LABEL[article.category] ?? { text: article.category.toUpperCase(), color: 'text-primary-600' };

  return (
    <div className="bg-white min-h-screen">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <Link
            to="/career-advice"
            className="inline-flex items-center gap-1 text-gray-400 hover:text-primary-600 text-sm font-medium transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Career Advice
          </Link>

          <p className={`text-xs font-bold uppercase tracking-[0.12em] mb-3 ${label.color}`}>
            {label.text}
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
            {article.title}
          </h1>

          {/* Author + meta */}
          <div className="flex items-center gap-3">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-10 h-10 rounded-full object-cover bg-gray-200 shrink-0"
            />
            <div>
              <p className="text-sm font-semibold text-gray-800">{article.author.name}</p>
              <p className="text-xs text-gray-400">{article.author.role} · {article.readTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Hero image ───────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="aspect-[21/9] overflow-hidden rounded-2xl bg-gray-100">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* ── Article body ─────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {article.body.map((section, i) => (
            <div key={i}>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{section.heading}</h2>
              <p className="text-gray-600 leading-relaxed">{section.text}</p>
            </div>
          ))}
        </div>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <div className="mt-14 bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to put this into practice?</h3>
          <p className="text-gray-500 text-sm mb-6">Browse thousands of open roles and take the next step.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
            <Link
              to="/career-advice"
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:border-primary-400 hover:text-primary-700 transition-colors"
            >
              More Articles
            </Link>
          </div>
        </div>

        {/* ── Related articles ──────────────────────────────────── */}
        {related.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-bold text-gray-900 mb-5">Related articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/career-advice/${r.slug}`}
                  className="group flex flex-col"
                >
                  <div className="aspect-[16/9] overflow-hidden rounded-xl mb-3 bg-gray-100">
                    <img
                      src={r.image}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${(CAT_LABEL[r.category] ?? {}).color ?? 'text-primary-600'}`}>
                    {(CAT_LABEL[r.category] ?? {}).text ?? r.category}
                  </p>
                  <p className="font-semibold text-sm text-gray-900 group-hover:text-primary-700 leading-snug">
                    {r.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{r.readTime}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
