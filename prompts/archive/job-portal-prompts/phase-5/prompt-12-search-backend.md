# Prompt 12 — Search & Filter Backend

## Phase
Phase 5 — Search & Public Pages

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
   - searchJobs(req, res) — parse all query params, call searchService
   - getJobDetail(req, res)
   - getCategories(req, res)
   - getTrending(req, res)
   - getSuggestions(req, res) — autocomplete for search bar

3. server/src/services/searchService.js — ADD:
   getSuggestions(keyword, limit=8):
   - Search job titles: ILIKE :keyword || '%' WHERE status='active', DISTINCT title, LIMIT 8
   - Search company names: ILIKE :keyword || '%', DISTINCT company_name, LIMIT 4
   - Search skills: ILIKE :keyword || '%', DISTINCT name, LIMIT 4
   - Return: { jobs: [], companies: [], skills: [] }

4. PostgreSQL setup — ADD tsvector column:
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

5. PUBLIC ROUTES — no auth required:
   server/src/routes/public.js:
   GET /jobs                    → optionalAuth, searchJobs
   GET /jobs/:slug              → optionalAuth, getJobDetail
   GET /jobs/suggestions        → getSuggestions
   GET /categories              → getCategories
   GET /trending                → getTrending
   GET /featured                → getFeaturedJobs
   GET /companies/:slug         → getCompanyDetail

Use raw Sequelize queries (sequelize.query) for FTS — Sequelize's ORM doesn't support tsvector well.
Use parameterized queries always. Log slow queries (>500ms) to Winston.
```

---

## Key Concepts to Learn

- **PostgreSQL Full-Text Search** — `tsvector` is a preprocessed searchable document; `tsquery` is the search query; `@@` is the match operator; `ts_rank` scores relevance
- **GIN indexes** — Generalized Inverted Index; optimized for full-text search and JSONB; much faster than LIKE queries for text search
- **`setweight`** — assign different weights to title (A) vs description (B); title matches score higher
- **Parameterized queries** — NEVER concatenate user input into SQL; use `replacements` in Sequelize.query: `{ query: 'WHERE id = :id', replacements: { id: userInput } }`
- **Dynamic query building** — build WHERE clause array and join with AND; avoids SQL injection and handles optional filters cleanly
- **`plainto_tsquery` vs `to_tsquery`** — `plainto_tsquery` is user-safe (handles arbitrary input); `to_tsquery` requires proper syntax

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
**Prompt 13 — Public Frontend Pages**
