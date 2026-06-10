---
description: Generate Supertest integration tests for an API route against a real test DB
---

The user wants Supertest integration tests for an Express API route in this project.

Project conventions from `testing/README.md`:
- Use real PostgreSQL test DB (`jobportal_test`) — no DB mocking
- Use `supertest` to make HTTP requests to the Express app
- Seed data in `beforeEach`, tear down in `afterEach`
- Test error cases as thoroughly as happy paths
- Group by route: `describe('POST /api/auth/register', () => {...})`

DB setup block to include:
```javascript
beforeAll(async () => {
  await sequelize.sync({ force: true });
  await runSeeders();
});
afterAll(async () => {
  await sequelize.close();
});
```

Generate tests covering:
1. **Happy path** — correct status, response shape, DB state after
2. **Auth** — 401 without token, 403 for wrong role
3. **Validation** — 400 for missing/invalid fields
4. **Not found** — 404 for non-existent resources
5. **Conflict** — 409 for duplicates where applicable
6. **Business rules** — domain-specific error cases

**Code rules:**
- Use `const request = require('supertest')` + `const app = require('../../src/app')`
- Helper `loginHelper(role)` returns `{ accessToken, user }` — implement once in beforeAll
- Set auth: `.set('Authorization', \`Bearer \${accessToken}\`)`
- Assert: `expect(res.status).toBe(...)`, `expect(res.body.success).toBe(true)`, key fields in `res.body.data`
- For cookie-based auth: use `request.agent(app)` to preserve cookies
- Verify DB state after mutations: query the model directly and assert

Output file path: `testing/integration/<resource-name>.test.js`
