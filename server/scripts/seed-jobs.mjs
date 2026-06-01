/**
 * Seed script — creates 20 dummy jobs across two employer accounts.
 * Run from the server directory: node scripts/seed-jobs.mjs
 */
// Node 18+ has built-in fetch — no import needed

const BASE = 'http://localhost:5000/api';

// ── Job data ──────────────────────────────────────────────────────────────────

const ALICE_JOBS = [
  {
    title: 'Senior React Developer',
    description: 'We are looking for an experienced React developer to join our product team. You will be responsible for building high-quality web applications, collaborating with designers and backend engineers, and driving technical decisions for our frontend stack.',
    requirements: '• 4+ years of React experience\n• Strong TypeScript skills\n• Experience with Redux or Zustand\n• Familiarity with REST APIs and GraphQL\n• Knowledge of CI/CD pipelines',
    benefits: '• Health & dental insurance\n• Flexible remote work\n• ₹1,000/month learning budget\n• Annual performance bonus\n• Free snacks and team lunches',
    jobType: 'full-time', workMode: 'remote', experienceLevel: 'senior',
    location: 'Remote (India)', salaryMin: 1800000, salaryMax: 2800000,
    skillNames: ['React', 'TypeScript', 'Redux', 'GraphQL', 'Node.js'], status: 'active',
  },
  {
    title: 'Backend Engineer — Node.js',
    description: 'Join our core infrastructure team to build scalable APIs and microservices. You will design and implement RESTful services, optimize database queries, and contribute to our cloud-native architecture on AWS.',
    requirements: '• 3+ years with Node.js\n• PostgreSQL or MySQL experience\n• Docker & Kubernetes knowledge\n• Experience with AWS or GCP\n• Strong debugging skills',
    benefits: '• Remote-first culture\n• Stock options\n• 25 days paid leave\n• Mental wellness allowance\n• Conference sponsorship',
    jobType: 'full-time', workMode: 'remote', experienceLevel: 'mid',
    location: 'Mumbai, India', salaryMin: 1400000, salaryMax: 2000000,
    skillNames: ['Node.js', 'PostgreSQL', 'Docker', 'AWS', 'REST API'], status: 'active',
  },
  {
    title: 'DevOps Engineer',
    description: 'We need a skilled DevOps engineer to manage our cloud infrastructure, automate deployments, and ensure 99.9% uptime for our platform. You will work closely with development teams to streamline the SDLC.',
    requirements: '• 3+ years in DevOps or SRE roles\n• AWS / GCP certified preferred\n• Terraform & Ansible experience\n• Kubernetes orchestration\n• Monitoring with Grafana/Prometheus',
    benefits: '• Hybrid work model\n• ₹50,000 annual wellness budget\n• Latest Macbook Pro\n• Team retreats twice a year',
    jobType: 'full-time', workMode: 'hybrid', experienceLevel: 'mid',
    location: 'Bengaluru, India', salaryMin: 1600000, salaryMax: 2400000,
    skillNames: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD'], status: 'active',
  },
  {
    title: 'Product Manager',
    description: 'Drive product strategy and roadmap for our SaaS platform. You will work with engineering, design, and customers to define product requirements, prioritize features, and measure impact.',
    requirements: '• 4+ years of PM experience\n• Strong data analysis skills\n• Experience with Agile/Scrum\n• Excellent communication\n• B2B SaaS background preferred',
    benefits: '• Equity package\n• Flexible hours\n• Monthly team offsites\n• Premium health insurance for family',
    jobType: 'full-time', workMode: 'onsite', experienceLevel: 'senior',
    location: 'Hyderabad, India', salaryMin: 2000000, salaryMax: 3200000,
    skillNames: ['Product Strategy', 'Agile', 'Jira', 'SQL', 'User Research'], status: 'active',
  },
  {
    title: 'QA Engineer',
    description: 'We are hiring a QA Engineer to design and execute test plans, build automated test suites, and ensure product quality across our web and mobile applications.',
    requirements: '• 2+ years of QA experience\n• Selenium or Cypress proficiency\n• API testing with Postman\n• JIRA / test management tools\n• ISTQB certification is a plus',
    benefits: '• Work-from-anywhere Fridays\n• Quarterly bonuses\n• Medical insurance\n• Ergonomic workspace setup allowance',
    jobType: 'full-time', workMode: 'hybrid', experienceLevel: 'entry',
    location: 'Pune, India', salaryMin: 700000, salaryMax: 1200000,
    skillNames: ['Selenium', 'Cypress', 'Postman', 'JIRA', 'Python'], status: 'active',
  },
  {
    title: 'Data Scientist',
    description: 'Help us extract insights from large datasets to drive business decisions. You will build ML models, design A/B experiments, and collaborate with product teams to embed data intelligence into the platform.',
    requirements: '• 3+ years in data science\n• Python, Pandas, Scikit-learn\n• SQL and big data tools\n• Experience with ML pipelines\n• Strong statistical knowledge',
    benefits: '• Research time each sprint\n• GPU compute allowance\n• Conference budget\n• Premium learning subscriptions',
    jobType: 'full-time', workMode: 'remote', experienceLevel: 'mid',
    location: 'Remote (India)', salaryMin: 1800000, salaryMax: 2600000,
    skillNames: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Statistics'], status: 'active',
  },
  {
    title: 'Frontend Intern',
    description: 'A 6-month paid internship for final-year students or recent graduates. You will contribute to real features, learn best practices from senior engineers, and get hands-on experience with a production codebase.',
    requirements: '• Basic HTML, CSS, JavaScript\n• Any React or Vue knowledge\n• Available for 6 months\n• Strong learning attitude\n• Portfolio or GitHub projects preferred',
    benefits: '• ₹25,000/month stipend\n• Pre-placement offer opportunity\n• Mentorship program\n• Certificate of completion',
    jobType: 'internship', workMode: 'hybrid', experienceLevel: 'entry',
    location: 'Bengaluru, India', salaryMin: 300000, salaryMax: 400000,
    skillNames: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'], status: 'active',
  },
  {
    title: 'Technical Lead — Full Stack',
    description: 'Lead a cross-functional team of 6 engineers building our next-generation platform. You will own architecture decisions, conduct code reviews, mentor team members, and work directly with product on technical feasibility.',
    requirements: '• 7+ years of software engineering\n• 2+ years in a lead role\n• Full-stack expertise\n• System design experience\n• Strong communication skills',
    benefits: '• Competitive equity\n• Director-level growth path\n• International travel opportunities\n• ₹2L annual L&D budget',
    jobType: 'full-time', workMode: 'hybrid', experienceLevel: 'lead',
    location: 'Mumbai, India', salaryMin: 3000000, salaryMax: 4500000,
    skillNames: ['React', 'Node.js', 'PostgreSQL', 'System Design', 'Leadership'], status: 'active',
  },
  {
    title: 'UX Researcher',
    description: 'Conduct user research to inform product decisions. You will plan and run usability studies, customer interviews, and surveys, then synthesize findings into actionable insights for the product and design teams.',
    requirements: '• 3+ years of UX research\n• Qualitative & quantitative methods\n• Usability testing tools\n• Strong storytelling ability\n• Figma familiarity preferred',
    benefits: '• Flexible schedule\n• Remote first\n• Research conference budget\n• Wellness stipend',
    jobType: 'full-time', workMode: 'remote', experienceLevel: 'mid',
    location: 'Remote (India)', salaryMin: 1200000, salaryMax: 1800000,
    skillNames: ['User Research', 'Usability Testing', 'Figma', 'Survey Design', 'Interviews'], status: 'draft',
  },
  {
    title: 'Cloud Architect',
    description: 'Design and oversee our multi-cloud strategy. You will define cloud standards, review infrastructure designs, drive cost optimisation, and ensure security compliance across AWS and GCP environments.',
    requirements: '• 8+ years of cloud experience\n• AWS Solutions Architect Professional\n• Multi-cloud strategy expertise\n• Security & compliance knowledge\n• Strong documentation skills',
    benefits: '• Top-of-market compensation\n• Equity package\n• Fully remote\n• ₹3L annual tech allowance',
    jobType: 'full-time', workMode: 'remote', experienceLevel: 'executive',
    location: 'Remote (India)', salaryMin: 4000000, salaryMax: 6000000,
    skillNames: ['AWS', 'GCP', 'Terraform', 'Security', 'Cloud Architecture'], status: 'active',
  },
];

const BOB_JOBS = [
  {
    title: 'UI/UX Designer',
    description: 'Create beautiful, intuitive interfaces for our suite of design tools. You will own the end-to-end design process from research to high-fidelity prototypes, and work closely with engineers to ensure pixel-perfect implementation.',
    requirements: '• 3+ years of UI/UX design\n• Expert in Figma\n• Strong visual design sensibility\n• Motion design experience preferred\n• Portfolio demonstrating product work',
    benefits: '• Creative freedom\n• Latest design tools subscription\n• Monthly design workshop budget\n• Hybrid work model',
    jobType: 'full-time', workMode: 'hybrid', experienceLevel: 'mid',
    location: 'San Francisco, CA', salaryMin: 1600000, salaryMax: 2400000,
    skillNames: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'Design Systems'], status: 'active',
  },
  {
    title: 'Brand Designer',
    description: 'Build and evolve the DesignHub brand identity. You will create marketing assets, establish brand guidelines, and ensure consistency across all touchpoints from digital to print.',
    requirements: '• 4+ years of brand design\n• Adobe Creative Suite mastery\n• Experience with brand guidelines\n• Strong typography skills\n• B2B brand experience preferred',
    benefits: '• Adobe CC license\n• Annual design conference pass\n• Profit sharing\n• Flexible hours',
    jobType: 'full-time', workMode: 'onsite', experienceLevel: 'mid',
    location: 'New York, NY', salaryMin: 1400000, salaryMax: 2000000,
    skillNames: ['Adobe Illustrator', 'Photoshop', 'Brand Identity', 'Typography', 'Figma'], status: 'active',
  },
  {
    title: 'Motion Designer',
    description: 'Bring our product and marketing experiences to life through animation. You will create micro-interactions for the product, explainer videos, social media content, and presentation animations.',
    requirements: '• 2+ years of motion design\n• After Effects expertise\n• Lottie animations for web/mobile\n• Strong storytelling ability\n• Video editing skills',
    benefits: '• State-of-the-art Mac Studio\n• Dribbble Pro subscription\n• Remote-friendly\n• Quarterly team outings',
    jobType: 'full-time', workMode: 'remote', experienceLevel: 'mid',
    location: 'Remote (US)', salaryMin: 1200000, salaryMax: 1800000,
    skillNames: ['After Effects', 'Lottie', 'Motion Design', 'Video Editing', 'Figma'], status: 'active',
  },
  {
    title: 'Frontend Developer — Design Systems',
    description: 'Build and maintain our component library and design system used by 200+ designers and developers. You will bridge the gap between design and engineering, ensuring components are accessible, documented, and consistent.',
    requirements: '• 3+ years of frontend development\n• React & Storybook experience\n• Accessibility (WCAG 2.1) knowledge\n• CSS architecture expertise\n• Design token experience preferred',
    benefits: '• Open-source contribution time\n• Design tool licenses\n• Flexible hours\n• Remote stipend ₹50,000/year',
    jobType: 'full-time', workMode: 'remote', experienceLevel: 'mid',
    location: 'Remote (India)', salaryMin: 1600000, salaryMax: 2400000,
    skillNames: ['React', 'Storybook', 'CSS', 'Accessibility', 'Design Systems'], status: 'active',
  },
  {
    title: 'Product Designer',
    description: 'Own the design of key product areas in our collaboration platform. You will work directly with PMs and engineers from discovery through delivery, running user research, crafting flows, and shipping polished UI.',
    requirements: '• 4+ years of product design\n• Strong systems thinking\n• Comfortable with ambiguity\n• Data-informed design decisions\n• Experience in SaaS products',
    benefits: '• Equity package\n• $500/year conference budget\n• Unlimited PTO\n• Home office setup allowance',
    jobType: 'full-time', workMode: 'hybrid', experienceLevel: 'senior',
    location: 'Austin, TX', salaryMin: 2000000, salaryMax: 3000000,
    skillNames: ['Product Design', 'Figma', 'User Research', 'Prototyping', 'Design Thinking'], status: 'active',
  },
  {
    title: 'Design Intern',
    description: 'A 3-month summer internship for design students. You will work on real projects alongside our senior designers, building your portfolio and learning industry-standard workflows.',
    requirements: '• Enrolled in design program\n• Figma or Adobe XD skills\n• Curiosity and strong visual eye\n• Portfolio of student work\n• Available full-time for 3 months',
    benefits: '• ₹20,000/month stipend\n• Mentorship from lead designers\n• Full tool access\n• Pre-placement opportunity',
    jobType: 'internship', workMode: 'onsite', experienceLevel: 'entry',
    location: 'New York, NY', salaryMin: 240000, salaryMax: 360000,
    skillNames: ['Figma', 'UI Design', 'Illustration', 'Presentation'], status: 'active',
  },
  {
    title: 'Head of Design',
    description: 'Lead our 12-person design team across product, brand, and marketing. You will define design vision, build design culture, collaborate with C-suite on strategic decisions, and hire world-class talent.',
    requirements: '• 10+ years of design experience\n• 4+ years in design leadership\n• Track record of scaling teams\n• Strong executive communication\n• Portfolio of team-scale impact',
    benefits: '• Competitive executive comp\n• Significant equity\n• Full remote flexibility\n• Unlimited conference travel',
    jobType: 'full-time', workMode: 'remote', experienceLevel: 'executive',
    location: 'Remote (US)', salaryMin: 5000000, salaryMax: 8000000,
    skillNames: ['Design Leadership', 'Figma', 'Hiring', 'Strategy', 'Design Systems'], status: 'active',
  },
  {
    title: 'Content Strategist',
    description: 'Shape the voice and content strategy for DesignHub. You will write product copy, create onboarding flows, develop help documentation, and build our content marketing engine.',
    requirements: '• 3+ years of content strategy\n• SaaS product copy experience\n• SEO knowledge\n• Strong editing skills\n• Data-driven content decisions',
    benefits: '• Writing conference budget\n• Tool subscriptions\n• Flexible remote work\n• Health & wellness allowance',
    jobType: 'full-time', workMode: 'remote', experienceLevel: 'mid',
    location: 'Remote (US)', salaryMin: 1000000, salaryMax: 1600000,
    skillNames: ['Content Strategy', 'Copywriting', 'SEO', 'UX Writing', 'CMS'], status: 'active',
  },
  {
    title: 'Illustrator / Visual Artist',
    description: 'Create original illustrations for our marketing, editorial, and in-product content. You will build and expand our illustration system and bring creative concepts to life across all brand channels.',
    requirements: '• 2+ years of professional illustration\n• Distinctive illustration style\n• Figma & Illustrator proficiency\n• Experience with icon systems\n• Animation skills are a bonus',
    benefits: '• Creative freedom with brand projects\n• iPad Pro + Apple Pencil provided\n• Part-time / contract considered\n• 20% time for personal projects',
    jobType: 'contract', workMode: 'remote', experienceLevel: 'mid',
    location: 'Remote (Worldwide)', salaryMin: 900000, salaryMax: 1400000,
    skillNames: ['Illustration', 'Adobe Illustrator', 'Figma', 'Icon Design', 'Visual Design'], status: 'active',
  },
  {
    title: 'Growth Marketing Manager',
    description: 'Drive user acquisition and retention for DesignHub. You will own our paid and organic growth channels, run experiments, analyse funnels, and work with design and product to improve conversion.',
    requirements: '• 4+ years of growth marketing\n• Performance marketing expertise\n• Strong SQL / analytics skills\n• A/B testing experience\n• PLG (product-led growth) background preferred',
    benefits: '• Generous marketing budget\n• Stock options\n• Hybrid work model\n• Team building budget',
    jobType: 'full-time', workMode: 'hybrid', experienceLevel: 'senior',
    location: 'San Francisco, CA', salaryMin: 2200000, salaryMax: 3400000,
    skillNames: ['Growth Marketing', 'Google Ads', 'SQL', 'A/B Testing', 'Analytics'], status: 'active',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Login failed for ${email}: ${json.message}`);
  console.log(`  ✓ Logged in as ${email}`);
  return json.data?.accessToken;
}

async function createJob(token, job) {
  const res = await fetch(`${BASE}/employer/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(job),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Job creation failed: ${json.message}`);
  return json.data?.job;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱  Seeding jobs...\n');

  // Alice — TechCorp Inc.
  console.log('── Alice (alice@techcorp.com)');
  const aliceToken = await login('alice@techcorp.com', 'Employer@1234');
  let aliceOk = 0;
  for (const job of ALICE_JOBS) {
    try {
      const created = await createJob(aliceToken, job);
      console.log(`  ✓ Created: ${created.title} [${created.status}]`);
      aliceOk++;
    } catch (e) {
      console.error(`  ✗ ${e.message}`);
    }
  }

  console.log(`\n── Bob (bob@designhub.com)`);
  const bobToken = await login('bob@designhub.com', 'Employer@1234');
  let bobOk = 0;
  for (const job of BOB_JOBS) {
    try {
      const created = await createJob(bobToken, job);
      console.log(`  ✓ Created: ${created.title} [${created.status}]`);
      bobOk++;
    } catch (e) {
      console.error(`  ✗ ${e.message}`);
    }
  }

  console.log(`\n✅  Done — ${aliceOk + bobOk}/20 jobs created (Alice: ${aliceOk}, Bob: ${bobOk})\n`);
}

seed().catch((e) => { console.error('\n❌  Fatal:', e.message); process.exit(1); });
