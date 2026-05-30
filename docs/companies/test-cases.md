# Companies — Test Cases

---

## Integration Tests

### GET /api/companies/:slug

```javascript
it('returns company with active jobs', async () => {
  await seedCompany({ slug: 'techcorp' });
  await seedJob({ status: 'active', employer_slug: 'techcorp' });
  const res = await request(app).get('/api/companies/techcorp');
  expect(res.status).toBe(200);
  expect(res.body.data.company.active_jobs).toHaveLength(1);
});

it('returns 404 for unknown slug', async () => {
  const res = await request(app).get('/api/companies/not-a-company');
  expect(res.status).toBe(404);
});
```

### POST /api/employer/company/logo

```javascript
it('accepts valid image and updates logo_url', async () => {
  const res = await employerAgent
    .post('/api/employer/company/logo')
    .attach('logo', 'test/fixtures/logo.png');
  expect(res.status).toBe(200);
  expect(res.body.data.logo_url).toMatch(/\.png$/);
});

it('rejects files over 2MB', async () => {
  const res = await employerAgent
    .post('/api/employer/company/logo')
    .attach('logo', 'test/fixtures/large.png');
  expect(res.status).toBe(400);
});
```

### GET /api/companies

```javascript
it('filters by industry', async () => {
  await seedCompanies([
    { industry: 'Technology' },
    { industry: 'Finance' }
  ]);
  const res = await request(app).get('/api/companies?industry=Technology');
  expect(res.body.data.companies.every(c => c.industry === 'Technology')).toBe(true);
});
```

---

## E2E Tests

```
1. Employer fills company profile
   - Login as employer
   - Navigate to /employer/company
   - Upload logo, fill description fields, save
   - Navigate to /companies/:slug — assert all fields visible

2. Public directory
   - Navigate to /companies
   - Assert company with active jobs appears
   - Click company → assert profile page loads
```
