# Jobs — Test Cases

---

## Unit Tests

### jobService.createJob

| Test | Expected |
|------|---------|
| Valid job, status=draft | Job created with slug, no quota check |
| Valid job, status=active, within quota | Job created and published |
| Valid job, status=active, quota exceeded | Throws 422 QUOTA_EXCEEDED |
| Duplicate slug collision | Retries with new suffix until unique |
| Skills provided | JobSkill rows created correctly |
| No application deadline | expires_at defaults to published_at + 30 days |

### jobService.checkQuota

| Plan | Active Jobs | Expected |
|------|------------|---------|
| free | 1 | Pass |
| free | 2 | Throw QUOTA_EXCEEDED |
| professional | 10 | Throw QUOTA_EXCEEDED |
| enterprise | 1000 | Pass |

### generateJobSlug

| Input | Expected |
|-------|---------|
| "Senior React Dev", "TechCorp" | matches `/^senior-react-dev-at-techcorp-[a-f0-9]{4}$/` |
| Title with special chars "C++ Dev" | special chars stripped |
| Very long title (300 chars) | truncated to 200 + suffix |

---

## Integration Tests

### GET /api/jobs

```javascript
it('returns only active, non-expired jobs', async () => {
  await seedJobs([
    { status: 'active', expires_at: future },
    { status: 'draft' },
    { status: 'active', expires_at: past },
  ]);
  const res = await request(app).get('/api/jobs');
  expect(res.body.data.jobs).toHaveLength(1);
});

it('filters by job_type', async () => {
  await seedJobs([{ job_type: 'full_time' }, { job_type: 'contract' }]);
  const res = await request(app).get('/api/jobs?job_type=contract');
  expect(res.body.data.jobs.every(j => j.job_type === 'contract')).toBe(true);
});

it('full-text search finds matching jobs', async () => {
  await seedJobs([{ title: 'React Developer' }, { title: 'Java Engineer' }]);
  const res = await request(app).get('/api/jobs?q=react');
  expect(res.body.data.jobs).toHaveLength(1);
  expect(res.body.data.jobs[0].title).toContain('React');
});
```

### POST /api/employer/jobs

```javascript
it('returns 201 with generated slug', async () => {
  const res = await employerAgent.post('/api/employer/jobs').send(validJobData);
  expect(res.status).toBe(201);
  expect(res.body.data.job.slug).toMatch(/^senior-react-developer-at-/);
});

it('returns 422 when quota exceeded', async () => {
  // Seed 2 active jobs for free plan employer
  await seedActiveJobs(employer, 2);
  const res = await employerAgent.post('/api/employer/jobs')
    .send({ ...validJobData, status: 'active' });
  expect(res.status).toBe(422);
  expect(res.body.error.code).toBe('QUOTA_EXCEEDED');
});
```

### POST /api/jobs/:jobId/apply

```javascript
it('creates application and returns 201', async () => {
  const res = await seekerAgent
    .post(`/api/jobs/${job.id}/apply`)
    .attach('resume', 'test/fixtures/resume.pdf');
  expect(res.status).toBe(201);
});

it('returns 409 on duplicate application', async () => {
  await seekerAgent.post(`/api/jobs/${job.id}/apply`).send({});
  const res = await seekerAgent.post(`/api/jobs/${job.id}/apply`).send({});
  expect(res.status).toBe(409);
});
```

### PATCH /api/employer/applications/:id/stage

```javascript
it('updates stage and sends notification', async () => {
  const res = await employerAgent
    .patch(`/api/employer/applications/${app.id}/stage`)
    .send({ stage: 'interview' });
  expect(res.status).toBe(200);
  // Verify notification created
  const notification = await Notification.findOne({ where: { user_id: seeker.user_id } });
  expect(notification).not.toBeNull();
});
```

---

## Cron Tests

```javascript
it('expires active jobs with past expires_at', async () => {
  const job = await seedJob({ status: 'active', expires_at: yesterday });
  await runJobExpiryCron();
  await job.reload();
  expect(job.status).toBe('expired');
});

it('does not expire future jobs', async () => {
  const job = await seedJob({ status: 'active', expires_at: tomorrow });
  await runJobExpiryCron();
  await job.reload();
  expect(job.status).toBe('active');
});
```

---

## E2E Tests (Playwright)

```
1. Employer creates job (draft)
   - Navigate to /employer/jobs/new
   - Fill all fields, select "Save as Draft"
   - Assert job appears in Drafts tab with no views_count

2. Employer publishes job
   - Click "Publish" on the draft
   - Assert job moves to Active tab
   - Navigate to /jobs — assert job visible in public listing

3. Seeker applies
   - Login as seeker
   - Find the published job
   - Click "Apply Now"
   - Upload PDF resume
   - Submit → assert "Application submitted" toast

4. Employer views ATS
   - Navigate to /employer/jobs/:id/applicants
   - Assert applicant card in "Applied" column
   - Drag to "Interview" column
   - Assert email notification sent (check email mock)
```
