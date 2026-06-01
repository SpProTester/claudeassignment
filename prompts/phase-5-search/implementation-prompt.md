# Prompt 12 â€” Search & Filter Backend

## Phase
Phase 5 â€” Search & Public Pages

## Objective
Build advanced job search API with PostgreSQL full-text search, multi-dimensional filters, ranking, and pagination.

---

## Prompt to Use

```
Build the advanced job search API for the Job Portal.

1. server/src/services/searchService.js:

   searchJobs({ keyword, location, job_type, work_mode, experience_level,
                salary_min, salary_max, category_id, is_remote,
                skills, sort_by, page, limit }):

   Build PostgreSQL query dynamically:
   
   BASE: SELECT jobs.*, emp.company_name, emp.logo_url, emp.is_verified,
         ts_rank(search_vector, query) as rank
         FROM job_listings jobs
         JOIN employer_profiles emp ON jobs.employer_id = emp.id
         WHERE jobs.status = 'active'
         AND jobs.published_at IS NOT NULL
   
   FILTERS (add conditionally):
   - keyword: AND search_vector @@ plainto_tsquery('english', :keyword)
   - location_country: AND LOWER(location_country) = LOWER(:country)
   - location_city: AND LOWER(location_city) LIKE LOWER(:city) || '%'
   - is_remote: AND (work_mode = 'remote' OR is_remote_global = true)
   - job_type: AND job_type = ANY(:job_types[])  [supports multi-select]
   - work_mode: AND work_mode = ANY(:work_modes[])
   - experience_level: AND experience_level = ANY(:levels[])
   - salary_min: AND salary_max >= :salary_min (job's max >= filter's min)
   - salary_max: AND salary_min <= :salary_max (job's min <= filter's max)
   - category_id: AND category_id = :category_id
   - skills: AND id IN (SELECT job_id FROM job_skills WHERE skill_id IN (:skill_ids))

   SORT:
   - 'relevance' (default): ORDER BY is_featured DESC, rank DESC, published_at DESC
   - 'date': ORDER BY published_at DESC
   - 'salary': ORDER BY salary_max DESC NULLS LAST
   
   PAGINATION: LIMIT :limit OFFSET (:page - 1) * :limit
   Count query for total: SELECT COUNT(*) with same WHERE clauses

   Also fetch: job skills (separate query), saved status if userId provided
   
   Return: { jobs, pagination: { page, limit, total, totalPages } }

   getJobDetail(slug, userId?):
   - Find active job by slug
   - Increment views_count (use raw UPDATE for atomicity)
   - Include: employer (company info), skills, category
   - If userId: check if seeker has applied, check if saved
   - Get similar jobs: same category OR matching skills, limit 5
   - Return full job detail object

   getCategories():
   - Find all top-level categories with job count
   - job_count = count of active jobs in that category
   - Return sorted by job_count DESC

   getTrending():
   - Track search queries: create SearchLog table (query, user_id, created_at)
   - SELECT query, COUNT(*) as count FROM search_logs
     WHERE created_at > NOW() - INTERVAL '7 days'
     GROUP BY query ORDER BY count DESC LIMIT 10
   - Also return trending job titles from job_listings

   logSearchQuery(query, userId?):
   - Insert into SearchLog table
   - Sanitize and normalize query before storing

   getFeaturedJobs(limit=6):
   - Return active featured jobs (is_featured=true), newest first

2. server/src/controllers/searchController.js:
   - searchJobs(req, res) â€” parse all query params, call searchService
   - getJobDetail(req, res)
   - getCategories(req, res)
   - getTrending(req, res)
   - getSuggestions(req, res) â€” autocomplete for search bar

3. server/src/services/searchService.js â€” ADD:
   getSuggestions(keyword, limit=8):
   - Search job titles: ILIKE :keyword || '%' WHERE status='active', DISTINCT title, LIMIT 8
   - Search company names: ILIKE :keyword || '%', DISTINCT company_name, LIMIT 4
   - Search skills: ILIKE :keyword || '%', DISTINCT name, LIMIT 4
   - Return: { jobs: [], companies: [], skills: [] }

4. PostgreSQL setup â€” ADD tsvector column:
   ALTER TABLE job_listings ADD COLUMN search_vector tsvector;
   UPDATE job_listings SET search_vector = 
     setweight(to_tsvector('english', title), 'A') ||
     setweight(to_tsvector('english', COALESCE(description, '')), 'B');
   CREATE INDEX idx_jobs_search ON job_listings USING GIN(search_vector);
   
   Create trigger to auto-update search_vector on INSERT/UPDATE:
   CREATE TRIGGER jobs_search_vector_update
   BEFORE INSERT OR UPDATE ON job_listings
   FOR EACH ROW EXECUTE FUNCTION tsvector_update_trigger(
     search_vector, 'pg_catalog.english', title, description
   );
   
   Create this as a migration file: server/src/database/migrations/002-add-search-vector.js

5. PUBLIC ROUTES â€” no auth required:
   server/src/routes/public.js:
   GET /jobs                    â†’ optionalAuth, searchJobs
   GET /jobs/:slug              â†’ optionalAuth, getJobDetail
   GET /jobs/suggestions        â†’ getSuggestions
   GET /categories              â†’ getCategories
   GET /trending                â†’ getTrending
   GET /featured                â†’ getFeaturedJobs
   GET /companies/:slug         â†’ getCompanyDetail

Use raw Sequelize queries (sequelize.query) for FTS â€” Sequelize's ORM doesn't support tsvector well.
Use parameterized queries always. Log slow queries (>500ms) to Winston.
```

---

## Key Concepts to Learn

- **PostgreSQL Full-Text Search** â€” `tsvector` is a preprocessed searchable document; `tsquery` is the search query; `@@` is the match operator; `ts_rank` scores relevance
- **GIN indexes** â€” Generalized Inverted Index; optimized for full-text search and JSONB; much faster than LIKE queries for text search
- **`setweight`** â€” assign different weights to title (A) vs description (B); title matches score higher
- **Parameterized queries** â€” NEVER concatenate user input into SQL; use `replacements` in Sequelize.query: `{ query: 'WHERE id = :id', replacements: { id: userInput } }`
- **Dynamic query building** â€” build WHERE clause array and join with AND; avoids SQL injection and handles optional filters cleanly
- **`plainto_tsquery` vs `to_tsquery`** â€” `plainto_tsquery` is user-safe (handles arbitrary input); `to_tsquery` requires proper syntax

---

## PostgreSQL Performance Tips

```sql
-- Check if index is being used
EXPLAIN ANALYZE SELECT * FROM job_listings
WHERE search_vector @@ plainto_tsquery('english', 'react developer');

-- Check slow queries
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC LIMIT 10;
```

---

## Validation Checklist

- [ ] `GET /api/jobs?keyword=react` returns relevant results ranked by relevance
- [ ] `GET /api/jobs?job_type=full_time&work_mode=remote` filters correctly
- [ ] `GET /api/jobs?salary_min=5000` only shows jobs with salary_max >= 5000
- [ ] `GET /api/jobs?keyword=react&location=new%20york&sort_by=date` works with multiple filters
- [ ] `GET /api/jobs/suggestions?q=rea` returns autocomplete results
- [ ] `GET /api/jobs/:slug` increments `views_count`
- [ ] Search logs are saved to SearchLog table
- [ ] Featured jobs appear first in results

---

## Next Step
**Prompt 13 â€” Public Frontend Pages**


# Prompt 13 â€” Public Frontend & Search UI

## Phase
Phase 5 â€” Search & Public Pages

## Objective
Build all public-facing pages: homepage, job search results with filters, job detail, and company profile â€” with URL-synced filters and skeleton loading.

---

## Prompt to Use

```
Build the public-facing pages for the Job Portal in React.

1. client/src/pages/public/HomePage.jsx:
   Hero Section:
   - Large headline: "Find Your Dream Job"
   - Subtitle text
   - Search form: keyword input + location input + "Search Jobs" button
   - Popular search tags below: "React Developer", "Product Manager", "Remote", etc.
   - Trending keywords from API

   Featured Companies row:
   - Horizontal scroll on mobile, grid on desktop
   - Company logo + name + open positions count
   - Click â†’ company profile page

   Job Categories grid (3x3 on desktop):
   - Category icon (emoji or SVG), name, job count
   - Click â†’ /jobs?category=:slug

   Recent Jobs list (6 cards):
   - JobCard component (reuse everywhere)
   - "View All Jobs" button at bottom

   Stats bar: "10,000+ Jobs", "5,000+ Companies", "1M+ Job Seekers"

2. client/src/components/shared/JobCard.jsx (reusable card):
   Props: job, showSaveButton (bool), onSave
   Content:
   - Company logo (fallback: company initials in colored circle)
   - Job title (link to /jobs/:slug)
   - Company name, location
   - Job type badge (Full-time/Remote/etc)
   - Salary range (if provided, else "Salary not disclosed")
   - Posted date (relative: "2 days ago")
   - Skills tags (first 3, "+N more" if more)
   - Save/unsave heart button (if showSaveButton)

3. client/src/pages/public/JobSearchPage.jsx:
   URL as source of truth for all filters â€” use useSearchParams()
   When filter changes: update URL params â†’ trigger new API call

   Layout: sidebar filters (280px) + main results

   Sidebar Filters:
   - Keyword search input (debounced 500ms, updates URL)
   - Location input (debounced)
   - Job Type: checkboxes (Full-time, Part-time, Contract, Internship, Freelance)
   - Work Mode: checkboxes (On-site, Remote, Hybrid)
   - Experience Level: checkboxes (Entry, Mid, Senior, Lead, Executive)
   - Salary Range: dual-handle range slider (min/max)
   - Category: select dropdown from API
   - "Clear All Filters" button (only show if any filter active)

   Main Results:
   - Active filter tags row (each tag has X to remove that filter)
   - Results count: "1,432 jobs found"
   - Sort dropdown: Relevance / Date / Salary
   - Job cards list (one per row on mobile, large cards on desktop)
   - Skeleton cards while loading (3 placeholder cards)
   - Pagination: numbered pages, prev/next buttons
   - No results state: illustration + "Try different keywords" message

4. client/src/pages/public/JobDetailPage.jsx:
   Use slug from URL params to fetch job

   Left column (65%):
   - Job title, company name + verified badge
   - Meta row: location, job type badge, work mode badge, experience level
   - Salary range (formatted nicely)
   - Posted date + deadline (if set)
   - "Apply Now" sticky button (becomes fixed at bottom on mobile)
   - Tabs: [Description] [Requirements] [Company]
   - Description tab: rich text rendered safely (dangerouslySetInnerHTML with sanitization)
   - Requirements tab: same
   - Company tab: logo, description, culture, benefits, link to company page

   Right sidebar (35%):
   - Apply card: "Apply Now" button (modal if logged in, redirect to login if not)
   - Job overview: type, mode, experience, deadline, salary
   - Similar Jobs list (3-4 cards)
   - Share buttons (copy link, LinkedIn, Twitter)

   Apply Modal (for logged-in seekers):
   - Select resume dropdown (list seeker's resumes)
   - Cover letter textarea (optional)
   - Submit button with loading state
   - "Already applied" state if duplicate

5. client/src/pages/public/CompanyProfilePage.jsx:
   - Company banner (gradient if no cover photo)
   - Logo, company name, verified badge
   - Industry, size, founded, website link
   - About section (description)
   - Culture & Benefits section
   - Open Positions list (active jobs for this company, filterable)

6. client/src/components/shared/SearchBar.jsx (reusable):
   - Keyword input with autocomplete dropdown
   - Autocomplete: show jobs, companies, skills in grouped sections
   - Debounced call to /api/jobs/suggestions
   - Keyboard navigation (arrow up/down, enter to select)
   - Click outside to close dropdown

ALSO CREATE:
- client/src/api/publicApi.js â€” search, job detail, categories, etc.
- client/src/hooks/useJobs.js â€” React Query hooks for all public data
- client/src/utils/formatters.js â€” formatSalary, formatDate, formatRelativeTime

All pages must have proper <title> and meta description for SEO (use react-helmet-async).
Fully responsive: mobile-first design.
Skeleton loading states for all data-dependent sections.
```

---

## Key Concepts to Learn

- **URL as state** â€” `useSearchParams()` reads/writes URL query params; shareable/bookmarkable search results; browser back/forward works correctly
- **Debouncing** â€” `useDebounce` hook delays API call until user stops typing (500ms); prevents API spam on every keystroke
- **Autocomplete UX** â€” keyboard navigation with arrow keys; `aria-*` attributes for accessibility; close on outside click (`useEffect` + `mousedown` event)
- **react-helmet-async** â€” set `<title>` and `<meta>` tags dynamically for each page; important for SEO on public job pages
- **Relative time** â€” `date-fns` `formatDistanceToNow` shows "2 days ago"; cleaner than raw dates

---

## Validation Checklist

- [ ] Search results update when URL changes (paste a URL with filters â†’ results match)
- [ ] Clearing filter tag removes it from URL and updates results
- [ ] Autocomplete shows grouped suggestions, navigable by keyboard
- [ ] Job detail shows apply modal for logged-in seekers
- [ ] Duplicate application shows "Already applied on [date]" state
- [ ] Company profile shows all open jobs
- [ ] All pages have custom `<title>` tags
- [ ] Mobile layout works for all pages

---

## Next Step
**Prompt 14 â€” Notification System**

