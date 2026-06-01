# Testing

> Quality assurance strategy: unit, integration, E2E, and performance testing.

---

## Folder Structure

```
testing/
├── unit/           # Jest unit tests (services, utilities, validators)
├── integration/    # Supertest API integration tests (real DB, no mocks)
├── e2e/            # Playwright end-to-end browser tests
└── performance/    # k6 load tests
```

---

## Testing Stack

| Layer | Tool | Coverage Target |
|-------|------|----------------|
| Unit | Jest | 80%+ for services and utilities |
| Integration | Jest + Supertest | All API endpoints |
| E2E | Playwright | Critical user flows |
| Performance | k6 | Key endpoints under load |

---

## Running Tests

```bash
# Unit + Integration (from server/ directory)
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # Coverage report

# Run specific test file
npm test -- auth.controller.test.js

# E2E (from project root)
npx playwright test
npx playwright test --headed   # Show browser
npx playwright show-report     # View HTML report

# Performance (requires k6 installed)
k6 run testing/performance/job-search.js
```

---

## Test Database

Integration tests run against a separate database: `jobportal_test`

```env
# server/.env.test
DATABASE_URL=postgresql://user:pass@localhost:5432/jobportal_test
NODE_ENV=test
```

Each test suite resets the database before running:
```javascript
beforeAll(async () => {
  await sequelize.sync({ force: true });
  await runSeeders();
});
afterAll(async () => {
  await sequelize.close();
});
```

---

## Unit Test Conventions

- File location: co-located with source OR in `testing/unit/`
- Naming: `{filename}.test.js`
- Mock external services (email, Stripe, S3) — never make real API calls in unit tests
- Test each service function independently with mocked DB calls
- One `describe` block per function, one `it` per test case

---

## Integration Test Conventions

- Use real PostgreSQL (test DB), no DB mocking
- Use `supertest` to make HTTP requests to the Express app
- Seed data in `beforeEach`; tear down in `afterEach`
- Test error cases as thoroughly as happy paths
- Group by route: `describe('POST /api/auth/register', () => {...})`

---

## E2E Test Conventions

- Location: `testing/e2e/`
- Naming: `{feature}.spec.ts`
- Use Playwright Page Object Model for reusable page interactions
- Test in Chromium (default) + Firefox + WebKit in CI
- Record videos on failure: `use: { video: 'on-first-retry' }`

---

## Critical Test Flows (E2E)

| Flow | File |
|------|------|
| Registration + Email Verification | `auth/register.spec.ts` |
| Login + Dashboard Redirect | `auth/login.spec.ts` |
| Employer creates and publishes job | `jobs/employer-post-job.spec.ts` |
| Seeker finds and applies to job | `jobs/seeker-apply.spec.ts` |
| Employer moves applicant in ATS | `jobs/ats-board.spec.ts` |
| Employer upgrades plan (mock Stripe) | `payments/upgrade.spec.ts` |

---

## Performance Tests

Location: `testing/performance/`

| Test | Endpoint | Target |
|------|----------|--------|
| Job search load | `GET /api/jobs?q=react` | 100 VUs, < 500ms p95 |
| Login load | `POST /api/auth/login` | 50 VUs, < 500ms p95 |
| Job detail load | `GET /api/jobs/:slug` | 200 VUs, < 300ms p95 |

---

## CI Integration

Tests run automatically on every PR via GitHub Actions:

```
.github/workflows/ci.yml:
  - npm test (unit + integration)
  - npx playwright test (E2E, headless Chromium)
  - Coverage report posted as PR comment
```
