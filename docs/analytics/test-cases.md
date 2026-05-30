# Analytics — Test Cases

---

## Integration Tests

### GET /api/employer/jobs/:id/stats

```javascript
it('returns correct views_count and applications_count', async () => {
  const job = await seedJob({ views_count: 100 });
  await seedApplications(job.id, 5);
  const res = await employerAgent.get(`/api/employer/jobs/${job.id}/stats`);
  expect(res.status).toBe(200);
  expect(res.body.data.views_count).toBe(100);
  expect(res.body.data.applications_count).toBe(5);
});

it('returns stage breakdown with correct counts', async () => {
  const job = await seedJob();
  await seedApplications(job.id, 3, { ats_stage: 'applied' });
  await seedApplications(job.id, 2, { ats_stage: 'interview' });
  const res = await employerAgent.get(`/api/employer/jobs/${job.id}/stats`);
  expect(res.body.data.applications_by_stage.applied).toBe(3);
  expect(res.body.data.applications_by_stage.interview).toBe(2);
});

it('returns daily_applications array for last 30 days', async () => {
  const job = await seedJob();
  await seedApplication(job.id, { created_at: yesterday });
  const res = await employerAgent.get(`/api/employer/jobs/${job.id}/stats`);
  const dailyData = res.body.data.daily_applications;
  expect(dailyData.some(d => d.count > 0)).toBe(true);
});
```

### GET /api/admin/analytics/search-trends

```javascript
it('returns top keywords sorted by count', async () => {
  await SearchLog.bulkCreate([
    { keywords: 'react', result_count: 10 },
    { keywords: 'react', result_count: 10 },
    { keywords: 'python', result_count: 5 },
  ]);
  const res = await adminAgent.get('/api/admin/analytics/search-trends?period=7d');
  expect(res.body.data.top_keywords[0].keyword).toBe('react');
  expect(res.body.data.top_keywords[0].count).toBe('2');
});
```
