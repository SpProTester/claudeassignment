# Prompt 19 — AI Job Recommendation Engine

## Phase
Phase 8 — AI Features

## Objective
Build an intelligent job recommendation engine using skill matching, scoring algorithms, and in-memory caching.

---

## Prompt to Use

```
Build the AI job recommendation engine for the Job Portal.

1. server/src/services/recommendationService.js:

   getJobRecommendations(userId, limit=10):
   - Check cache (node-cache): key 'recommendations:{userId}'
   - If cached and not expired (1 hour TTL): return cached result
   - Generate fresh recommendations:
   
   Step 1 — Fetch seeker context:
   - SeekerProfile: experience_years, salary_min, salary_max, current_location, experience_years
   - SeekerSkills: array of skill IDs
   - Applied job IDs (to exclude): Application.findAll where seeker_id = profileId
   - Saved job IDs: SavedJob.findAll
   
   Step 2 — Candidate job query:
   SELECT 
     jl.*,
     ep.company_name, ep.logo_url, ep.is_verified,
     COUNT(DISTINCT js.skill_id) FILTER (WHERE js.skill_id IN (:seekerSkillIds)) as matched_skills,
     COUNT(DISTINCT js.skill_id) as total_required_skills
   FROM job_listings jl
   JOIN employer_profiles ep ON jl.employer_id = ep.id
   LEFT JOIN job_skills js ON jl.id = js.job_id AND js.is_required = true
   WHERE jl.status = 'active'
     AND jl.id NOT IN (:appliedJobIds)
   GROUP BY jl.id, ep.company_name, ep.logo_url, ep.is_verified
   HAVING COUNT(DISTINCT js.skill_id) FILTER (WHERE js.skill_id IN (:seekerSkillIds)) > 0
      OR jl.experience_level = :seekerExpLevel
   ORDER BY jl.published_at DESC
   LIMIT 100

   Step 3 — Score each job (0-100):
   scoreJob(job, seekerProfile, seekerSkillIds):
   
   skillMatchScore (40 points):
     if total_required_skills = 0: 20 (no skills required, partial credit)
     else: (matched_skills / total_required_skills) * 40
   
   experienceScore (20 points):
     MATCH_MAP = { entry: [0,2], mid: [2,5], senior: [5,8], lead: [7,12], executive: [10,99] }
     if seekerYears in range for job's level: 20
     if off by 1 level: 10
     else: 0
   
   salaryScore (20 points):
     if job has no salary: 10 (neutral)
     if seeker has no preference: 10
     overlap = max(0, min(jobMax, seekerMax) - max(jobMin, seekerMin))
     if overlap > 0: 20
     if close (within 20%): 10
     else: 0
   
   recencyScore (10 points):
     daysOld = (NOW - publishedAt) in days
     if daysOld <= 1: 10
     if daysOld <= 7: 8
     if daysOld <= 14: 5
     if daysOld <= 30: 2
     else: 0
   
   featuredBonus (10 points):
     if is_featured: 10 else: 0

   Step 4 — Sort by score DESC, take top :limit
   Step 5 — Cache result for 1 hour
   Step 6 — Return sorted jobs with score and match details

   getCandidateRecommendations(employerUserId, jobId, limit=20):
   - Get job's required skills (skill IDs)
   - Get job's experience_level, salary_min, salary_max
   - Query seekers:
     SELECT sp.*, u.full_name, u.avatar_url,
       COUNT(ss.skill_id) FILTER (WHERE ss.skill_id IN (:jobSkillIds)) as matched_skills
     FROM seeker_profiles sp
     JOIN users u ON sp.user_id = u.id
     LEFT JOIN seeker_skills ss ON sp.id = ss.seeker_id
     WHERE sp.open_to_work = true
       AND sp.profile_visibility != 'private'
     GROUP BY sp.id, u.full_name, u.avatar_url
     HAVING COUNT(ss.skill_id) FILTER (WHERE ss.skill_id IN (:jobSkillIds)) >= 1
     ORDER BY matched_skills DESC
     LIMIT :limit
   - Score each candidate (similar algorithm, reversed)
   - Return scored candidate list

2. server/src/routes/seekers.js — ADD:
   GET /recommendations → getJobRecommendations

3. server/src/routes/employer.js — ADD:
   GET /jobs/:id/candidate-recommendations → getCandidateRecommendations

4. Install: npm install node-cache

5. server/src/jobs/recommendationCron.js:
   - Schedule: '0 2 * * *' (2 AM daily)
   - Pre-warm cache for top 1000 active seekers
   - Refresh recommendations for seekers who have been active in last 7 days
   - Log: cache refresh count, duration

FRONTEND:

6. client/src/components/seeker/RecommendedJobs.jsx:
   - Used on seeker dashboard and homepage (for logged-in seekers)
   - Fetches from /api/seekers/recommendations
   - Shows job cards with "Match score" chip (e.g., "87% match")
   - Match breakdown tooltip on hover: "4/5 skills matched, salary match, recent"
   - "Refresh recommendations" button (clears cache, refetches)

7. client/src/components/employer/CandidateSuggestions.jsx:
   - On ATS page, "AI Suggestions" tab
   - Lists top matching candidates for the specific job
   - Candidate card: name, headline, match %, matched skills highlighted
   - "View Profile" and "Invite to Apply" buttons
```

---

## Key Concepts to Learn

- **Scoring algorithm design** — weight different factors by business importance; skill match is most important (40%), recency matters less (10%); tune based on feedback
- **In-memory caching with `node-cache`** — simple key-value cache in Node.js process; resets on server restart; use Redis for multi-server production
- **SQL `FILTER` clause** — `COUNT(*) FILTER (WHERE condition)` is PostgreSQL-specific conditional aggregation; more efficient than CASE WHEN
- **Cache warming** — pre-computing recommendations at 2 AM when server load is low; avoids cold-start latency for first request
- **Recommendation tradeoffs** — collaborative filtering (what similar users liked) vs content-based (skill matching); this implementation uses content-based which is simpler and doesn't have cold-start problem

---

## Validation Checklist

- [ ] Seeker with React skills gets React jobs recommended
- [ ] Already-applied jobs don't appear in recommendations
- [ ] Score breakdown shows correct percentages
- [ ] Second request within 1 hour is served from cache (check response time)
- [ ] Employer sees candidate suggestions ranked by skill match
- [ ] Refreshing recommendations clears cache and returns updated results

---

## Next Step
**Prompt 20 — Admin Backend**
