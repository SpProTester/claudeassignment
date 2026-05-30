# Analytics Module

> Platform-wide and per-employer analytics for data-driven decision making.

---

## Overview

The Analytics module provides two levels of reporting:

1. **Employer Analytics** — per-job and overall performance metrics visible in the employer dashboard (views, applications, conversion rates, ATS funnel)
2. **Platform Analytics** — admin-level aggregated data (total users, jobs, revenue, search trends)

**Status:** Basic analytics (job views/applications) are live. Advanced analytics (funnels, conversion, charts) are planned for Phase 9.

**Scope:**
- Job-level: views_count, applications_count, daily trends
- Employer-level: total applications, time-to-hire, top performing listings
- Platform-level (admin): registrations, active jobs, search query trends, revenue

---

## Key Files

| File | Responsibility |
|------|---------------|
| `server/src/models/SearchLog.js` | Search query data |
| `server/src/controllers/employer.jobs.controller.js` | `getJobStats` handler |
| `server/src/controllers/admin.controller.js` | `getStats` handler (planned) |
| `client/src/pages/employer/EmployerDashboard.jsx` | Analytics overview for employer |

---

## Metrics Tracked

| Metric | Source | Who Sees It |
|--------|--------|------------|
| Job views | `job_listings.views_count` | Employer |
| Applications count | `applications` table COUNT | Employer |
| Applications by ATS stage | `applications.ats_stage` GROUP BY | Employer |
| Daily views trend | Custom query (planned) | Employer |
| Search query trends | `search_logs` | Admin |
| User registration trend | `users.created_at` GROUP BY day | Admin |
| Revenue | Stripe API | Admin |

---

## Related Docs

- [Requirements](requirements.md)
- [API Reference](api.md)
- [Database Schema](database-schema.md)
- [Frontend Flow](frontend-flow.md)
- [Backend Flow](backend-flow.md)
- [Test Cases](test-cases.md)
- [Jira Notes](jira-notes.md)
