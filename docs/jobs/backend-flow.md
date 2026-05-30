# Jobs — Backend Flow

---

## Public Job Search Request

```
GET /api/jobs?q=react&location=remote&job_type=full_time&page=1
  │
  ├─ [optionalAuth] — attaches req.user if token provided (for is_saved flag)
  │
  ├─ job.search.controller.js → searchJobs(req, res, next)
  │     └─ Build WHERE clause:
  │           status = 'active'
  │           AND expires_at > NOW()
  │           AND deleted_at IS NULL
  │           AND (q ? tsvector @@ plainto_tsquery('english', q) : true)
  │           AND (location ? location_city ILIKE %location% OR work_mode='remote' : true)
  │           AND (job_type ? job_type = ? : true)
  │     └─ Include: employer_profiles AS company (name, logo_url, slug)
  │     └─ Include: skills
  │     └─ Log search to search_logs table (async)
  │     └─ Return paginated results
  │
  └─ Response 200
```

---

## Job Creation Request

```
POST /api/employer/jobs
  │
  ├─ [authenticateToken] → req.user
  ├─ [authorizeRole('employer')]
  ├─ [createJobRules] → express-validator
  ├─ [validate.middleware]
  │
  ├─ employer.jobs.controller.js → createJob(req, res, next)
  │     └─ jobService.createJob(req.user.userId, req.body)
  │           ├─ Load EmployerProfile by userId
  │           ├─ QUOTA CHECK:
  │           │   activeCount = count(job_listings WHERE employer_id=? AND status IN ['active','paused'])
  │           │   if activeCount >= plan_limit → throw AppError(422, 'QUOTA_EXCEEDED')
  │           ├─ Generate slug: generateJobSlug(title, company_name)
  │           │   → check slug uniqueness → append random suffix if collision
  │           ├─ Transaction:
  │           │   ├─ JobListing.create({ ...data, employer_id, slug })
  │           │   └─ JobSkill.bulkCreate(skills.map(s => ({ job_id, skill_id: s })))
  │           └─ Return job with skills
  │
  └─ Response 201
```

---

## ATS Stage Change

```
PATCH /api/employer/applications/:applicationId/stage
  │
  ├─ [authenticateToken + authorizeRole('employer')]
  │
  ├─ ats.controller.js → updateStage(req, res, next)
  │     └─ Verify: application belongs to employer's job
  │     └─ Validate stage transition (no invalid moves)
  │     └─ Application.update({ ats_stage, stage_notes, stage_updated_at })
  │     └─ IF new stage IN ['interview', 'offer', 'rejected']:
  │           notificationService.notify(seeker_id, {
  │             type: 'APPLICATION_STATUS',
  │             message: `Your application for ${job.title} has been moved to ${stage}`
  │           })
  │           emailService.sendApplicationStatusEmail(seeker.email, job.title, stage)
  │
  └─ Response 200: updated application
```

---

## Expiry Cron Job

File: `server/src/services/job-expiry.cron.js`

```javascript
// Runs: '0 * * * *' (every hour, on the hour)
cron.schedule('0 * * * *', async () => {
  const expired = await JobListing.findAll({
    where: {
      status: 'active',
      expires_at: { [Op.lt]: new Date() }
    }
  });

  for (const job of expired) {
    await job.update({ status: 'expired' });
    await Notification.create({
      user_id: job.employer.user_id,
      type: 'JOB_EXPIRED',
      message: `Your job listing "${job.title}" has expired.`
    });
    // Send email async (no await)
    emailService.sendJobExpiredEmail(job.employer.email, job.title);
  }

  logger.info(`Job expiry cron: expired ${expired.length} listings`);
});
```

---

## Quota Logic

```javascript
const PLAN_LIMITS = {
  free: 2,
  professional: 10,
  business: 50,
  enterprise: Infinity,
};

async function checkQuota(employerProfile) {
  const activeCount = await JobListing.count({
    where: {
      employer_id: employerProfile.id,
      status: ['active', 'paused'],
      deleted_at: null,
    }
  });
  const limit = PLAN_LIMITS[employerProfile.subscription_plan];
  if (activeCount >= limit) {
    throw new AppError('QUOTA_EXCEEDED', 422,
      `Your ${employerProfile.subscription_plan} plan allows ${limit} active listings. Upgrade to post more.`
    );
  }
}
```

---

## Slug Generation

```javascript
function generateJobSlug(title, companyName) {
  const base = `${title}-at-${companyName}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 200);
  const suffix = crypto.randomBytes(2).toString('hex'); // 4 chars
  return `${base}-${suffix}`;
}
```

---

## Route Map

| Method | Path | Auth | Handler |
|--------|------|------|---------|
| GET | `/api/jobs` | Optional | `searchJobs` |
| GET | `/api/jobs/:slug` | Optional | `getJobBySlug` |
| POST | `/api/employer/jobs` | employer | `createJob` |
| GET | `/api/employer/jobs` | employer | `getEmployerJobs` |
| GET | `/api/employer/jobs/:id` | employer | `getJobById` |
| PUT | `/api/employer/jobs/:id` | employer | `updateJob` |
| DELETE | `/api/employer/jobs/:id` | employer | `deleteJob` |
| PUT | `/api/employer/jobs/:id/status` | employer | `changeJobStatus` |
| GET | `/api/employer/jobs/:id/stats` | employer | `getJobStats` |
| POST | `/api/jobs/:jobId/apply` | seeker | `applyToJob` |
| GET | `/api/employer/jobs/:jobId/applicants` | employer | `getApplicants` |
| PATCH | `/api/employer/applications/:id/stage` | employer | `updateStage` |
