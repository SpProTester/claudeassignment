# Search — Test Cases

---

## Integration Tests

### GET /api/jobs (FTS)

```javascript
it('returns jobs matching keyword in title', async () => {
  await seedJobs([{ title: 'React Developer' }, { title: 'Python Engineer' }]);
  const res = await request(app).get('/api/jobs?q=react');
  expect(res.body.data.jobs).toHaveLength(1);
  expect(res.body.data.jobs[0].title).toBe('React Developer');
});

it('returns jobs matching keyword in description', async () => {
  await seedJob({ title: 'Developer', description: 'Must know React and Redux' });
  const res = await request(app).get('/api/jobs?q=redux');
  expect(res.body.data.jobs).toHaveLength(1);
});

it('returns zero results for non-existent keyword', async () => {
  const res = await request(app).get('/api/jobs?q=cobol9000notexist');
  expect(res.body.data.jobs).toHaveLength(0);
  expect(res.body.data.pagination.total).toBe(0);
});

it('sorts by salary_desc correctly', async () => {
  await seedJobs([{ salary_max: 100000 }, { salary_max: 200000 }]);
  const res = await request(app).get('/api/jobs?sort=salary_desc');
  expect(res.body.data.jobs[0].salary_max).toBe(200000);
});

it('filters by multiple facets', async () => {
  await seedJobs([
    { job_type: 'full_time', work_mode: 'remote' },
    { job_type: 'contract', work_mode: 'remote' },
    { job_type: 'full_time', work_mode: 'onsite' },
  ]);
  const res = await request(app).get('/api/jobs?job_type=full_time&work_mode=remote');
  expect(res.body.data.jobs).toHaveLength(1);
});
```

### GET /api/search/autocomplete

```javascript
it('returns title and skill suggestions', async () => {
  await seedJobs([{ title: 'React Developer', status: 'active' }]);
  await Skill.create({ name: 'React', slug: 'react' });
  const res = await request(app).get('/api/search/autocomplete?q=rea');
  const types = res.body.data.suggestions.map(s => s.type);
  expect(types).toContain('title');
  expect(types).toContain('skill');
});

it('returns empty array for q < 2 chars', async () => {
  const res = await request(app).get('/api/search/autocomplete?q=r');
  expect(res.body.data.suggestions).toHaveLength(0);
});
```

---

## Performance Tests

- 50,000 job records seeded in test DB
- Search for "software engineer" must complete in < 500ms (p95)
- `EXPLAIN ANALYZE` confirms GIN index usage (no seq scan on search_vector)
