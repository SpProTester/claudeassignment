# Jobs — Requirements

---

## Functional Requirements

### FR-JOBS-001: Job Creation
- Employer SHALL be able to create job listings with: title, description, job_type, work_mode, experience_level, location, salary range, skills, application deadline
- System SHALL enforce per-plan job posting quotas before allowing creation
- System SHALL auto-generate a unique URL slug from the job title and company name
- System SHALL allow saving as `draft` without publishing

### FR-JOBS-002: Job Publishing & Lifecycle
- Employer SHALL be able to publish a draft listing (status → active)
- System SHALL set `published_at` timestamp when first activated
- System SHALL default `expires_at` to 30 days from `published_at` if not specified
- Employer SHALL be able to pause, reactivate, or close a listing
- System (cron) SHALL automatically expire listings where `expires_at < now()`

### FR-JOBS-003: Quota Enforcement
- System SHALL reject job creation / activation when employer has reached plan limit
- System SHALL return HTTP 422 with `QUOTA_EXCEEDED` error and upgrade CTA message
- System SHALL check quota at both creation (if status=active) and status change to active

### FR-JOBS-004: Public Job Discovery
- Any visitor SHALL be able to browse active job listings without authentication
- System SHALL support filtering by: keyword, location, job_type, work_mode, experience_level, salary range, category
- System SHALL support sorting by: relevance, date posted, salary
- System SHALL support pagination (default 20 per page)

### FR-JOBS-005: Job Application
- Authenticated seekers SHALL be able to apply to active jobs
- System SHALL prevent duplicate applications to the same job
- Seeker SHALL be able to attach a resume (PDF, max 5MB) or select a saved resume
- System SHALL send confirmation email to seeker and notification to employer on new application

### FR-JOBS-006: Saved Jobs
- Authenticated seekers SHALL be able to save/unsave job listings
- Saved jobs SHALL be viewable in the seeker dashboard

### FR-JOBS-007: ATS Board
- Employer SHALL be able to view all applications for a job on a Kanban board
- Employer SHALL be able to drag-and-drop applicants between stages
- Employer SHALL be able to add notes to an applicant
- System SHALL send email notification to applicant when their stage changes to Interview, Offer, or Rejected

### FR-JOBS-008: Job Analytics
- Employer SHALL see view count and application count per listing
- Employer SHALL see a daily views vs applications chart (last 30 days)
- Employer SHALL see application breakdown by ATS stage

---

## Non-Functional Requirements

### NFR-JOBS-001: Performance
- Public job listing page MUST load within 2 seconds (p95) with 1000 concurrent users
- Job search MUST return results within 500ms for full-text queries

### NFR-JOBS-002: SEO
- Each job listing MUST have a unique, human-readable URL slug
- Job detail page MUST include structured data (JSON-LD) for Google Jobs indexing

### NFR-JOBS-003: Data Integrity
- Applications MUST be stored even if employer deletes the job listing (soft delete)
- Job history MUST be preserved for analytics even after expiry

---

## Acceptance Criteria

- [ ] Create job with `status=draft` — not visible in public search
- [ ] Publish job — appears in search within 60 seconds
- [ ] Exceed quota — receive 422 with upgrade message
- [ ] Apply to job — application row created, confirmation email sent
- [ ] Duplicate apply — receive 409 error
- [ ] Drag application from "Applied" to "Interview" — email sent to applicant
- [ ] Cron runs hourly — expired jobs removed from public search
- [ ] Job stats show correct view and application counts
