---
description: Create a Jira story in the format used in docs/<module>/jira-notes.md
---

The user wants to create a Jira story for a feature or bug in the Monster.com replica project.

Project Jira format from `docs/<module>/jira-notes.md`:

**Epic prefix pattern:** JP-<MODULE> (e.g., JP-AUTH, JP-JOBS, JP-ATS, JP-PAYMENTS, JP-SEARCH, JP-NOTIFICATIONS, JP-RESUME, JP-ADMIN, JP-ANALYTICS)

**Module → Epic mapping:**
- Authentication → JP-AUTH
- Jobs / Job Listings → JP-JOBS
- ATS / Applications → JP-ATS
- Payments / Billing → JP-PAYMENTS
- Search → JP-SEARCH
- Notifications → JP-NOTIFICATIONS
- Resume / Resume Builder → JP-RESUME
- Admin → JP-ADMIN
- Analytics → JP-ANALYTICS
- Seeker Profile → JP-SEEKER
- Employer → JP-EMPLOYER

Generate the story in this format:

---

## Story: JP-<MODULE>-XXX: <Title>

**Epic:** JP-<MODULE> — <Epic Name>
**Type:** Story / Bug / Task / Spike *(pick one)*
**Priority:** Critical / High / Medium / Low
**Story Points:** [1 / 2 / 3 / 5 / 8]
**Status:** To Do

### Description
[User story format: "As a <role>, I want to <action>, so that <benefit>"]

### Acceptance Criteria
- [ ] 
- [ ] 
- [ ] 

### Technical Notes
[Relevant files, API endpoints, DB tables, known constraints]

### Test Cases
[Link to test cases or brief list of scenarios to verify]

### Dependencies
[Other stories or PRs this depends on, if any]

---

If the user describes a **bug**, use this format instead of Acceptance Criteria:

### Steps to Reproduce / Expected / Actual
[Fill from description]

### Definition of Done
- [ ] Bug reproduced on local
- [ ] Root cause identified
- [ ] Fix implemented and unit tested
- [ ] Regression test added
- [ ] QA sign-off
