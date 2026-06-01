# Prompt 23 — Testing (Backend + Frontend)

## Phase
Phase 10 — Final Integration & Deployment

## Objective
Write unit tests, integration tests, and frontend component tests covering all critical flows.

---

## Prompt to Use

```
Write comprehensive tests for the Job Portal application.

BACKEND TESTING (Jest + Supertest):

1. server/jest.config.js:
   {
     testEnvironment: 'node',
     transform: {},  // ES modules — no transform needed
     testMatch: ['**/__tests__/**/*.test.js'],
     setupFilesAfterFramework: ['./src/__tests__/setup.js'],
     collectCoverageFrom: ['src/**/*.js', '!src/database/migrations/**'],
     coverageThreshold: { global: { branches: 70, functions: 80, lines: 80 } }
   }

2. server/src/__tests__/setup.js:
   - beforeAll: Connect to test database (TEST_DATABASE_URL from env)
   - beforeAll: Run migrations on test DB
   - afterAll: Close DB connection
   - beforeEach: Wrap test in transaction, rollback after test
   - Mock Nodemailer: jest.mock('../utils/email.js')
   - Mock Stripe: jest.mock('stripe')
   - Mock OpenAI: jest.mock('../config/openai.js')

3. server/src/__tests__/auth.test.js — 15 test cases:
   
   describe('POST /api/auth/register'):
   ✓ should register a new job seeker and return 201
   ✓ should register a new employer with company_name
   ✓ should return 409 when email already exists
   ✓ should return 400 when password is too weak (no uppercase)
   ✓ should return 400 when role is invalid
   ✓ should hash password (not store plain text)
   ✓ should create SeekerProfile on seeker registration
   ✓ should create EmployerProfile on employer registration

   describe('POST /api/auth/login'):
   ✓ should login and return accessToken + set cookie
   ✓ should return 401 for wrong password
   ✓ should return 401 for non-existent email
   ✓ should return 403 for suspended account
   ✓ should lock account after 5 failed attempts
   ✓ should return generic error (not reveal if email exists)

   describe('GET /api/auth/me'):
   ✓ should return user data with valid token
   ✓ should return 401 with expired token
   ✓ should return 401 with no token

4. server/src/__tests__/jobs.test.js — 12 test cases:
   
   beforeEach: create employer user + login, save accessToken
   
   describe('POST /api/employer/jobs — Create Job'):
   ✓ should create job with required fields only, return 201 with slug
   ✓ should auto-generate unique slug from title + company
   ✓ should return 422 when free employer exceeds 2 job quota
   ✓ should return 400 when title is missing
   ✓ should return 400 when description < 100 chars
   ✓ should return 400 when deadline is in the past

   describe('POST /api/jobs/:id/apply — Apply to Job'):
   Setup: create seeker + employer + active job
   ✓ should apply successfully, return 201 with application
   ✓ should return 409 when applying twice to same job
   ✓ should return 404 when job is closed
   ✓ should return 401 when not authenticated
   ✓ should return 403 when employer tries to apply (wrong role)
   ✓ should increment applications_count on job listing

5. server/src/__tests__/search.test.js — 8 test cases:
   Setup: seed 20 diverse job listings
   
   ✓ should return all active jobs with default pagination
   ✓ should filter by keyword using full-text search
   ✓ should filter by job_type=full_time
   ✓ should filter by work_mode=remote
   ✓ should filter by salary_min (returns jobs where max >= filter min)
   ✓ should sort by date (newest first)
   ✓ should return empty array for no matches (not 404)
   ✓ should increment views_count when fetching job detail

6. server/src/__tests__/ats.test.js — 8 test cases:
   Setup: employer + job + seeker + application
   
   ✓ should get applicants for own job
   ✓ should not get applicants for another employer's job (403)
   ✓ should update stage from 'applied' to 'shortlisted'
   ✓ should create ApplicationHistory on stage change
   ✓ should create Notification for seeker on stage change
   ✓ should add internal note to application
   ✓ should set rating 1-5
   ✓ should return 400 for invalid stage value

FRONTEND TESTING (Vitest + React Testing Library):

7. client/vitest.config.js:
   {
     plugins: [react()],
     test: {
       environment: 'jsdom',
       setupFiles: './src/__tests__/setup.jsx',
       globals: true,
     }
   }

8. client/src/__tests__/setup.jsx:
   - Import @testing-library/jest-dom for custom matchers
   - Mock axiosInstance: return success by default
   - Mock react-router-dom navigate
   - Mock react-hot-toast
   - Wrap all renders in QueryClientProvider + MemoryRouter

9. client/src/__tests__/LoginForm.test.jsx — 8 test cases:
   ✓ should render email and password fields
   ✓ should show validation error when email is empty
   ✓ should show validation error when password is empty
   ✓ should show password when eye icon clicked
   ✓ should call login API with correct credentials on submit
   ✓ should show error toast on failed login
   ✓ should disable submit button while loading
   ✓ should redirect to dashboard on successful login

10. client/src/__tests__/JobCard.test.jsx — 5 test cases:
    ✓ should render job title, company, location
    ✓ should show salary range when provided
    ✓ should show "Salary not disclosed" when not provided
    ✓ should show save button when showSaveButton prop is true
    ✓ should call onSave when heart button clicked

11. client/src/__tests__/ApplicationTracker.test.jsx — 5 test cases:
    ✓ should render applications list
    ✓ should filter by stage tab
    ✓ should show "No applications" when list is empty
    ✓ should show withdraw button only for 'applied' stage
    ✓ should call withdraw API and remove application on confirm

Show complete code for all test files. Include example of how to run coverage report.
```

---

## Test Running Commands

```bash
# Backend
cd server
npm test                          # Run all tests
npm run test:coverage             # Run with coverage report
npm run test -- --testPathPattern=auth  # Run specific file

# Frontend
cd client
npm test                          # Run all tests (Vitest)
npm run test:ui                   # Open Vitest UI browser
npm run test:coverage             # Coverage report
```

---

## Coverage Goals

| Module | Target Coverage |
|--------|----------------|
| Auth service | 90% |
| Job service | 85% |
| ATS service | 80% |
| Search service | 80% |
| Payment service | 75% |
| React components | 70% |
| Utility functions | 95% |

---

## Key Concepts to Learn

- **Test isolation** — each test should be independent; use `beforeEach` to reset state; rollback DB transactions after each test
- **Mocking external services** — mock Stripe, OpenAI, email; tests should not make real API calls or send real emails
- **Integration vs unit tests** — unit tests test a single function; integration tests test the HTTP endpoint end-to-end including DB
- **Supertest** — makes HTTP requests to your Express app without starting a real server; `await request(app).post('/api/auth/login').send(data)`
- **`@testing-library/react`** — tests from user's perspective; `getByRole`, `getByLabelText` prefer over `getByTestId`

---

## Validation Checklist

- [ ] All 48+ test cases pass
- [ ] Coverage meets thresholds (CI fails if below)
- [ ] No tests make real external API calls
- [ ] DB is clean after each test (transaction rollback)
- [ ] Frontend tests don't require a running backend

---

## Next Step
**Prompt 24 — Deployment**
