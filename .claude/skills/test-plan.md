---
description: Create a structured QA test plan for a module or feature
---

The user wants a test plan for a module, feature, or release in the Monster.com replica job portal.

Generate a complete test plan document with the following sections:

---

## Test Plan: [Feature/Module Name]

### 1. Objective
[What is being tested and why]

### 2. Scope
**In Scope:**
- [List features/flows to test]

**Out of Scope:**
- [What is explicitly not tested]

### 3. Test Environment
- Frontend: http://localhost:5173 (client), http://localhost:5174 (admin)
- Backend API: http://localhost:5000/api
- Database: PostgreSQL (local)
- Browsers: Chrome, Firefox, Safari
- Tools: Playwright (automation), Postman (API), manual testing

### 4. Test Types
| Type | Tool | Coverage |
|------|------|----------|
| Manual | Browser | Exploratory, UX |
| E2E Automated | Playwright | Critical flows |
| API Automated | Playwright request | All endpoints |
| Regression | Playwright | Impacted areas |

### 5. Test Cases Summary
[List major test scenarios grouped by flow — detail comes from /write-test-cases]

### 6. Entry Criteria
- [ ] Feature code merged to branch
- [ ] Server running with latest migrations
- [ ] Test data seeded

### 7. Exit Criteria
- [ ] All P1/P2 test cases passed
- [ ] No Critical/High open bugs
- [ ] Regression suite passing

### 8. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|

### 9. Timeline
| Phase | Activity | Duration |
|-------|----------|----------|

---
