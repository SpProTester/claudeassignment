---
description: Generate Jest unit tests for a service function in server/src/services/
---

The user wants Jest unit tests for a service function in this project.

Project conventions from `testing/README.md`:
- Location: `testing/unit/` or co-located with source
- Naming: `{filename}.test.js`
- Mock external services (email, Stripe, file upload) — never real API calls in unit tests
- Mock DB calls via jest.mock or jest.spyOn
- One `describe` block per function, one `it` per test case
- Coverage target: 80%+

Generate Jest unit tests covering:
1. Happy path (valid inputs, expected return)
2. Edge cases (empty arrays, null/undefined, boundary values)
3. Error cases (throws expected errors with correct message/code)
4. Side effects (verify mocked functions were called with correct args)

**Code rules:**
- Use CommonJS (`require`) to match the server's .cjs convention
- Mock with `jest.mock()` at top, `jest.spyOn()` for individual method mocks
- Use `beforeEach(() => jest.clearAllMocks())` to reset between tests
- Import from `server/src/services/<name>.service.js`
- For DB model mocks: `jest.mock('../../models', () => ({ ModelName: { findOne: jest.fn(), create: jest.fn(), ... } }))`
- Assert thrown errors with `await expect(fn()).rejects.toThrow(...)` or `rejects.toMatchObject({ statusCode, code })`

Output file path: `testing/unit/<service-name>.service.test.js`

After the code, list untested edge cases worth adding later under a `## What's Not Covered` section.
