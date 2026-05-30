# Jobs — Jira Notes

---

## Epic: JP-JOBS — Job Listing & Application Management

**Priority:** Critical | **Status:** Production

---

## Stories

### JP-JOBS-001: Employer Job Creation & Publishing
**Points:** 8 | **Status:** Done

**Acceptance Criteria:**
- [ ] Multi-section job creation form
- [ ] Draft saving (no immediate publish)
- [ ] One-click publish from draft
- [ ] Quota enforcement with upgrade prompt
- [ ] Auto-generated URL slug

### JP-JOBS-002: Public Job Discovery & Filtering
**Points:** 5 | **Status:** Done

**Acceptance Criteria:**
- [ ] Paginated job listing page
- [ ] Filter by type, mode, experience, salary, category
- [ ] Full-text keyword search
- [ ] Sort by date / salary / relevance
- [ ] Shareable filtered URLs (params in URL)

### JP-JOBS-003: Job Application
**Points:** 5 | **Status:** Done

**Acceptance Criteria:**
- [ ] Apply with file upload or saved resume
- [ ] Duplicate application prevention
- [ ] Confirmation email to seeker
- [ ] New application notification to employer

### JP-JOBS-004: ATS Kanban Board
**Points:** 8 | **Status:** Done

**Acceptance Criteria:**
- [ ] 7-stage Kanban: Applied → Reviewing → Shortlisted → Interview → Offer → Hired → Rejected
- [ ] Drag-and-drop stage transitions
- [ ] Applicant detail panel with CV preview
- [ ] Stage change notifications sent to applicant

### JP-JOBS-005: Job Lifecycle Management
**Points:** 3 | **Status:** Done

**Acceptance Criteria:**
- [ ] Status transitions: draft → active → paused → active → closed
- [ ] Hourly cron auto-expires overdue listings
- [ ] Employer notified when listing expires

### JP-JOBS-006: Saved Jobs (Seeker)
**Points:** 2 | **Status:** Done

**Acceptance Criteria:**
- [ ] Save/unsave toggle on job cards and detail page
- [ ] Saved jobs viewable in seeker dashboard
- [ ] Requires authentication (prompt login if not signed in)

---

## Known Tech Debt

- Full-text search is PostgreSQL FTS (tsvector); Elasticsearch migration planned for v2 when job count exceeds 100k
- `views_count` is incremented on every page load (no deduplication by IP/session); should add Redis-based dedup
- Application file storage is local (`uploads/resumes/`); needs S3 migration before production
