# Jobs Module

> Full lifecycle management of job listings: creation, publishing, ATS, and public discovery.

---

## Overview

The Jobs module covers everything related to job listings from an employer's perspective (create, publish, manage, track) and from a seeker's perspective (discover, view, apply, save). It is the core revenue-generating feature of the platform.

**Scope:**
- Employer: create / edit / publish / pause / close job listings
- Employer: per-plan posting quota enforcement
- Employer: ATS (Applicant Tracking System) — Kanban board with stage transitions
- Seeker: browse job listings with filters
- Seeker: apply to jobs with resume attachment
- Seeker: save/unsave jobs
- Public: job detail page (no auth required)
- Cron: auto-expire listings past their `expires_at` date

**Out of scope:** External job board integrations (Indeed, LinkedIn) — planned for v2.

---

## Key Files

### Backend
| File | Responsibility |
|------|---------------|
| `server/src/controllers/employer.jobs.controller.js` | Employer job CRUD handlers |
| `server/src/controllers/jobs.controller.js` | Public job listing endpoints |
| `server/src/controllers/applications.controller.js` | Application submit/manage |
| `server/src/controllers/ats.controller.js` | ATS board stage management |
| `server/src/models/JobListing.js` | Job listing Sequelize model |
| `server/src/models/Application.js` | Application model |
| `server/src/services/job-expiry.cron.js` | Hourly expiry cron job |
| `server/src/routes/employer.jobs.routes.js` | Employer job routes |
| `server/src/routes/jobs.routes.js` | Public job routes |

### Frontend
| File | Responsibility |
|------|---------------|
| `client/src/pages/Jobs.jsx` | Public job listing + search page |
| `client/src/pages/JobDetail.jsx` | Single job detail + apply CTA |
| `client/src/pages/employer/EmployerJobs.jsx` | Employer job management table |
| `client/src/pages/employer/JobForm.jsx` | Create / edit job form |
| `client/src/pages/employer/ApplicantsBoard.jsx` | Kanban ATS board |
| `client/src/components/jobs/JobCard.jsx` | Reusable job card component |
| `client/src/services/jobs.service.js` | Axios calls for jobs |
| `client/src/services/employer.service.js` | Axios calls for employer job management |

---

## Job Status Machine

```
draft ──→ active ──→ paused ──→ active
                └──→ closed
                     ↑
              expired (auto, cron)
```

- `draft` → `active`: triggers quota check, sets `published_at`
- `active` → `paused`: keeps listing in DB, hides from search
- `paused` → `active`: re-checks quota before re-activating
- Any → `closed`: soft delete; cannot be re-opened (post a new listing)
- `expired`: auto-set by cron when `expires_at < now`

---

## Subscription Plans & Quotas

| Plan | Active Job Limit | Featured Listings | Analytics |
|------|-----------------|-------------------|-----------|
| Free | 2 | No | Basic |
| Professional | 10 | 3 | Standard |
| Business | 50 | 15 | Advanced |
| Enterprise | Unlimited | Unlimited | Full |

---

## ATS Stages

```
Applied → Reviewing → Shortlisted → Interview → Offer → Hired
                                              ↓
                                           Rejected (any stage)
```

---

## Related Docs

- [Requirements](requirements.md)
- [API Reference](api.md)
- [Database Schema](database-schema.md)
- [Frontend Flow](frontend-flow.md)
- [Backend Flow](backend-flow.md)
- [Test Cases](test-cases.md)
- [Jira Notes](jira-notes.md)
