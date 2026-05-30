# Jobs — Frontend Flow

---

## Public Seeker Flow

### Browse Jobs

```
/ (Home) → Search bar CTA
  ↓
/jobs?q=react&location=remote
  ↓
Jobs.jsx renders:
  ├─ Filter sidebar (job_type, work_mode, experience, salary, category)
  ├─ Sort dropdown
  ├─ Job card list (JobCard.jsx × N)
  └─ Pagination controls

JobCard.jsx shows:
  - Company logo + name
  - Job title + slug link
  - Location + work_mode badge
  - Salary range (if disclosed)
  - Posted X days ago
  - Save button (heart icon — requires login)
  - "Quick Apply" button
```

### View Job Detail

```
/jobs/:slug
  ↓
JobDetail.jsx:
  ├─ Job header (title, company, badges)
  ├─ Full description (rendered HTML)
  ├─ Skills tags
  ├─ Salary + location sidebar
  ├─ Apply CTA (opens ApplicationModal if logged in, else /login redirect)
  └─ Similar jobs section
```

### Apply to Job

```
"Apply Now" clicked
  ↓
Auth check → redirect /login if not authenticated
  ↓
ApplicationModal:
  ├─ Select saved resume OR upload new PDF (max 5MB)
  ├─ Optional cover letter textarea
  └─ Submit → POST /api/jobs/:jobId/apply
  ↓
Success → toast "Application submitted!" + disable Apply button ("Applied")
Error 409 → toast "You've already applied"
```

---

## Employer Flow

### Job Management Table

```
/employer/jobs
  ↓
EmployerJobs.jsx:
  ├─ Stats cards (Total / Active / Draft / Expired)
  ├─ Filter tabs: All / Active / Draft / Paused / Closed
  ├─ Job rows with:
  │   - Title + status badge
  │   - Applications count (links to ATS board)
  │   - Views count
  │   - Published date + Expires date
  │   - Actions: Edit / Publish / Pause / Close / Stats
  └─ "+ Post a Job" button → /employer/jobs/new
```

### Create / Edit Job

```
/employer/jobs/new
/employer/jobs/:id/edit
  ↓
JobForm.jsx (multi-section):
  ├─ Section 1: Basic Info (title, category, job_type, work_mode, experience_level)
  ├─ Section 2: Location (city, country, remote option)
  ├─ Section 3: Compensation (salary_min, salary_max, currency, disclose toggle)
  ├─ Section 4: Description (rich text editor)
  ├─ Section 5: Skills (autocomplete tag input)
  ├─ Section 6: Application (deadline, external_url toggle)
  └─ Actions: "Save Draft" | "Publish Now"
  ↓
POST/PUT /api/employer/jobs
  ↓
Success → redirect to /employer/jobs with toast
Quota exceeded → show UpgradeModal
```

### ATS Board

```
/employer/jobs/:id/applicants
  ↓
ApplicantsBoard.jsx:
  └─ Kanban columns: Applied | Reviewing | Shortlisted | Interview | Offer | Hired | Rejected
      Each column:
        - Applicant card (name, headline, application date, resume link)
        - Drag-and-drop between columns → PATCH /api/employer/applications/:id/stage
        - Click card → ApplicantDetailPanel (notes, CV preview, stage history)
```

---

## State Management

### Zustand / React Query

- `useQuery(['jobs', filters])` — public job listing (cached 2 min)
- `useQuery(['job', slug])` — single job detail
- `useMutation()` — apply to job, save job, post job
- `useInfiniteQuery(['jobs', filters])` — infinite scroll variant (mobile)

### Filter State

- All filters stored in URL search params (not component state)
- `useSearchParams()` from React Router v6 syncs filter to URL
- Enables shareable filtered URLs and browser back/forward navigation

---

## Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `JobCard.jsx` | `components/jobs/` | Reusable job preview card |
| `JobForm.jsx` | `pages/employer/` | Create/edit form |
| `ApplicantsBoard.jsx` | `pages/employer/` | Kanban ATS board |
| `EmployerJobs.jsx` | `pages/employer/` | Job management table |
| `Jobs.jsx` | `pages/` | Public listing + filters |
| `JobDetail.jsx` | `pages/` | Full job detail |
