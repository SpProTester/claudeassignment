---
description: Generate Playwright API tests for a REST endpoint in this project
---

The user wants API tests for one or more endpoints in the Monster.com replica backend.

API base URL: `http://localhost:5000/api`

Generate Playwright API tests using `request` context (not browser). Cover:
- 200/201 success cases
- 400 bad request / validation errors
- 401 unauthorized (no token)
- 403 forbidden (wrong role)
- 404 not found
- Any other relevant status codes for the endpoint

**Code rules:**
- Use TypeScript with `@playwright/test` — `test`, `expect`, `APIRequestContext`
- Use `request.get/post/put/patch/delete` with full URL
- Set auth header: `Authorization: Bearer ${token}` where needed
- Obtain tokens via `POST /api/auth/login` in `beforeAll`
- Assert `response.status()`, `response.ok()`, and key fields in `await response.json()`
- Group in `test.describe('API: <endpoint>')` block
- Use separate describes for seeker, employer, admin roles where relevant

Output file path suggestion: `testing/api/<resource-name>.api.spec.ts`

After the code, add a short summary table:

| Method | Endpoint | Scenario | Expected Status |
|--------|----------|----------|-----------------|
