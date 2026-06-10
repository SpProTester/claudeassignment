---
description: Generate structured manual + Playwright test cases for a feature or component
---

The user wants test cases for a feature, page, or component in the Monster.com replica job portal.

Generate a complete set of test cases covering:
- Happy path (positive flows)
- Edge cases
- Negative / error cases
- UI/UX validation (if frontend)
- Authorization (who can/cannot access)

Format each test case as:

| TC ID | Title | Preconditions | Steps | Expected Result | Type |
|-------|-------|--------------|-------|-----------------|------|

Use TC-001, TC-002, etc. for IDs.
Type column: Manual | Automated

After the table, generate Playwright test code for all cases marked as Automated.

**Playwright code rules:**
- Use TypeScript
- Use `@playwright/test` — `test`, `expect`, `Page`
- Base URL: `http://localhost:5173` for client, `http://localhost:5174` for admin
- API base: `http://localhost:5000/api`
- Use `page.goto()`, `page.fill()`, `page.click()`, `page.waitForURL()`, `expect(page).toHaveURL()`, `expect(page.locator(...)).toBeVisible()`
- Group tests in a `test.describe` block named after the feature
- Add a `beforeEach` for login if the feature requires authentication
- Keep selectors role-based (`getByRole`, `getByLabel`, `getByPlaceholder`) over CSS where possible

Output the Playwright file path suggestion as: `testing/e2e/<feature-name>.spec.ts`
