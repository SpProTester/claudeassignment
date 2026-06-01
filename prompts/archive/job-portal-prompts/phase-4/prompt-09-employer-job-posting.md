# Prompt 09 — Employer Job Posting Backend

## Phase
Phase 4 — Employer Module

## Objective
Build all job posting CRUD APIs with quota enforcement, slug generation, scheduled publishing, and a cron job for auto-expiring listings.

---

## Prompt to Use

```
Build job posting management APIs for the Employer in Node.js/Express.

All routes protected by: authenticateToken + authorizeRole('employer')
Base path: /api/employer

1. server/src/utils/helpers.js — ADD:
   generateJobSlug(title, companyName):
   - Combine: "{title}-at-{companyName}-{random4chars}"
   - Lowercase, replace spaces/special chars with hyphens
   - Remove consecutive hyphens
   - Example: "Senior React Developer at TechCorp-a3f9"
   
   generatePagination(page, limit, total):
   - Return { page, limit, total, totalPages, hasNext, hasPrev }

2. server/src/services/jobService.js:

   createJob(userId, data):
   - Get employer profile by userId
   - Check quota: count active jobs vs job_post_limit
     - If at limit: throw AppError(422, 'Job posting quota exceeded. Upgrade your plan.')
   - Generate unique slug from title + company name
   - Create JobListing with status = data.status ('draft' or 'active')
   - If status = 'active': set published_at = NOW()
   - If expires_at not provided: default to 30 days from publish date
   - If skills provided: create JobSkill records
   - Return created job with skills

   getEmployerJobs(userId, { status, page, limit }):
   - Find all jobs for employer with optional status filter
   - Include skills, application count
   - Order by created_at DESC
   - Return paginated results

   getJobById(userId, jobId):
   - Find job by id, verify employer ownership
   - Include skills, category
   - Return job data

   updateJob(userId, jobId, data):
   - Verify ownership
   - Don't allow editing closed/expired jobs
   - If changing status from draft to active: set published_at, set expires_at
   - Update skills: delete old JobSkill records, insert new ones
   - Update job fields
   - Return updated job

   changeJobStatus(userId, jobId, newStatus):
   - Verify ownership
   - Validate status transitions:
     draft → active (valid)
     active → paused (valid)
     paused → active (valid)
     active/paused → closed (valid)
     closed → any (invalid — can't reopen)
     expired → any (invalid)
   - If activating: check quota again
   - Update status, set published_at if first activation

   deleteJob(userId, jobId):
   - Verify ownership
   - Soft delete: set status = 'closed', deleted_at = NOW()
   - Return success message

   getJobStats(userId, jobId):
   - Verify ownership
   - Return: { views_count, applications_count, 
     applications_by_stage: { applied, reviewing, shortlisted, ... },
     daily_views: [...last 30 days], daily_applications: [...last 30 days] }

3. server/src/validators/jobValidators.js:
   createJobRules:
   - title: required, max 255 chars
   - description: required, min 100 chars, max 10000
   - job_type: required, in enum values
   - work_mode: required, in enum values
   - experience_level: required, in enum values
   - location_country: required
   - salary_min/max: optional integers, max > min if both provided
   - application_deadline: optional, must be future date
   - external_url: optional, valid URL

4. server/src/routes/employer.js — job routes:
   POST   /jobs                → createJobRules, createJob
   GET    /jobs                → getEmployerJobs (query: status, page, limit)
   GET    /jobs/:id            → getJobById
   PUT    /jobs/:id            → createJobRules (partial), updateJob
   DELETE /jobs/:id            → deleteJob
   PUT    /jobs/:id/status     → changeJobStatus
   GET    /jobs/:id/stats      → getJobStats

5. server/src/jobs/jobExpiryCron.js:
   - Use node-cron: schedule '0 * * * *' (every hour)
   - Find all jobs where status='active' AND expires_at < NOW()
   - Update status = 'expired'
   - For each expired job: create Notification for employer
   - Send email to employer: "Your job listing '{title}' has expired"
   - Log count of expired jobs
   - Export and start in server.js

6. COMPANY PROFILE ROUTES (server/src/routes/employer.js):
   GET    /profile             → getCompanyProfile
   PUT    /profile             → updateCompanyProfile
   POST   /profile/logo        → logoUpload.single('logo'), uploadLogo

   uploadLogo:
   - Multer config: images only (jpeg/png/webp), max 2MB
   - Store in uploads/logos/{companySlug}.{ext}
   - Update employer_profiles.logo_url
```

---

## Key Concepts to Learn

- **Quota enforcement** — check at creation AND status change to active; can't bypass by creating in draft then activating
- **Status machine** — define which transitions are valid; `closed → active` should be blocked (forces re-posting)
- **Cron jobs** — `node-cron` schedules functions using cron syntax; runs in same Node.js process; for production consider separate worker process
- **Slug uniqueness** — append random chars to handle duplicate job titles; always check DB for collision
- **Soft deletes** — setting `deleted_at` keeps data for analytics and audit; add `WHERE deleted_at IS NULL` to all normal queries

---

## Quota Logic by Plan

```javascript
const PLAN_LIMITS = {
  free: 2,
  professional: 10,
  business: 50,
  enterprise: Infinity,
};

const checkQuota = async (employerProfile) => {
  const activeCount = await JobListing.count({
    where: { employer_id: employerProfile.id, status: ['active', 'paused'] }
  });
  const limit = PLAN_LIMITS[employerProfile.subscription_plan];
  if (activeCount >= limit) throw new AppError(422, 'QUOTA_EXCEEDED');
};
```

---

## Validation Checklist

- [ ] Create job returns 201 with generated slug
- [ ] Creating job when quota exceeded returns 422 with upgrade message
- [ ] Status transitions: draft→active works, closed→active returns error
- [ ] Updating skills replaces previous skills correctly
- [ ] Hourly cron marks overdue listings as expired
- [ ] Expired job triggers employer notification
- [ ] Job stats return daily view/application data for charts

---

## Next Step
**Prompt 10 — ATS (Applicant Tracking) Backend**
