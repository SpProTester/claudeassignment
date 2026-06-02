/**
 * Keyword-to-category mapping for auto-assigning job categories.
 *
 * Rules are checked in ORDER — first match wins.
 * More specific rules (e.g. DevOps, Data) must come before broader ones (Engineering).
 * Keyword matching is case-insensitive substring search on the job title.
 */
export const CATEGORY_RULES = [
  {
    slug: 'devops-cloud',
    keywords: [
      'devops', 'site reliability engineer', 'sre ', 'platform engineer',
      'cloud engineer', 'infrastructure engineer', 'devsecops',
      'cloud architect', 'aws engineer', 'azure engineer', 'gcp engineer',
      'kubernetes engineer', 'terraform',
    ],
  },
  {
    slug: 'data-analytics',
    keywords: [
      'data scientist', 'data engineer', 'data analyst', 'data architect',
      'data warehouse', 'machine learning engineer', 'ml engineer',
      'ai engineer', 'artificial intelligence engineer', 'deep learning engineer',
      'analytics engineer', 'business intelligence analyst', 'bi analyst',
      'quantitative analyst', 'research analyst',
    ],
  },
  {
    slug: 'engineering',
    keywords: [
      'software engineer', 'software developer', 'frontend engineer',
      'backend engineer', 'fullstack engineer', 'full stack engineer',
      'full-stack engineer', 'ios engineer', 'android engineer',
      'mobile engineer', 'web developer', 'frontend developer',
      'backend developer', 'fullstack developer', 'full stack developer',
      'qa engineer', 'test engineer', 'quality assurance engineer',
      'security engineer', 'systems engineer', 'embedded engineer',
      'solutions architect', 'software architect', 'technical lead',
      'tech lead', 'staff engineer', 'principal engineer',
      'engineer', 'developer', 'programmer',
    ],
  },
  {
    slug: 'design',
    keywords: [
      'ui/ux designer', 'ux designer', 'ui designer', 'product designer',
      'graphic designer', 'visual designer', 'motion designer',
      'web designer', 'interaction designer', 'brand designer',
      'design lead', 'head of design', 'designer',
    ],
  },
  {
    slug: 'product',
    keywords: [
      'product manager', 'product owner', 'product lead',
      'product director', 'vp of product', 'head of product',
      'chief product officer', 'cpo',
    ],
  },
  {
    slug: 'marketing',
    keywords: [
      'marketing manager', 'marketing director', 'marketing lead',
      'digital marketer', 'seo specialist', 'seo manager', 'sem specialist',
      'content writer', 'content strategist', 'content manager', 'copywriter',
      'social media manager', 'social media specialist', 'brand manager',
      'growth manager', 'growth hacker', 'demand generation', 'email marketer',
      'marketing',
    ],
  },
  {
    slug: 'sales',
    keywords: [
      'account executive', 'sales manager', 'sales director', 'sales lead',
      'sales representative', 'sales rep', 'inside sales', 'outside sales',
      'business development manager', 'business development representative',
      'bdr', 'sdr', 'sales engineer', 'revenue manager', 'commercial manager',
      'vp of sales', 'head of sales', 'sales',
    ],
  },
  {
    slug: 'finance',
    keywords: [
      'financial analyst', 'finance manager', 'finance director',
      'financial controller', 'chief financial officer', 'cfo',
      'treasurer', 'investment analyst', 'portfolio manager',
      'tax specialist', 'tax manager', 'budget analyst',
      'financial advisor', 'financial planner', 'accountant',
      'accounting manager', 'head of finance', 'finance', 'financial',
    ],
  },
  {
    slug: 'human-resources',
    keywords: [
      'hr manager', 'hr director', 'hr executive', 'hr business partner',
      'hr generalist', 'hr specialist', 'human resources manager',
      'chief human resources officer', 'chro', 'head of hr', 'head of people',
      'talent acquisition', 'technical recruiter', 'recruiter',
      'people operations', 'people ops', 'payroll manager',
      'learning and development', 'l&d manager', 'hr',
    ],
  },
  {
    slug: 'customer-success',
    keywords: [
      'customer success manager', 'customer success lead',
      'customer support manager', 'customer service manager',
      'support engineer', 'client success manager', 'cx manager',
      'customer experience manager', 'customer success', 'customer support',
    ],
  },
  {
    slug: 'legal',
    keywords: [
      'general counsel', 'legal counsel', 'associate counsel',
      'lawyer', 'attorney', 'legal director', 'compliance manager',
      'compliance officer', 'paralegal', 'legal advisor', 'legal',
    ],
  },
  {
    slug: 'operations',
    keywords: [
      'operations manager', 'operations director', 'chief operating officer',
      'coo', 'supply chain manager', 'logistics manager', 'office manager',
      'project manager', 'program manager', 'scrum master', 'agile coach',
      'business analyst', 'process improvement', 'operations',
    ],
  },
];

/**
 * Infer a category slug from a job title.
 * Returns the slug of the first matching rule, or null if none match.
 */
export function inferCategorySlug(title) {
  if (!title) return null;
  const lower = title.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return rule.slug;
    }
  }
  return null;
}
