# Prompt 11 — Employer Frontend Dashboard

## Phase
Phase 4 — Employer Module

## Objective
Build the complete Employer dashboard UI including job posting multi-step form, ATS Kanban board with drag-and-drop, analytics charts, and company profile editor.

---

## Prompt to Use

```
Build the Employer dashboard frontend in React with Tailwind CSS, React Query, and @dnd-kit for drag-and-drop.

1. client/src/layouts/EmployerLayout.jsx:
   - Sidebar with: Dashboard, My Jobs, Post a Job, Candidates, Analytics, Company Profile, Billing, Settings
   - Header: company logo/name, notification bell, user dropdown
   - Active job/candidate counts in sidebar

2. client/src/pages/employer/DashboardPage.jsx:
   - Top KPI row: Active Jobs, Total Applications (this month), Shortlisted, Hired
   - Quick actions: "Post a Job", "View All Applicants"
   - Chart: Applications over last 30 days (Line chart — Recharts)
   - Table: Your Active Jobs with columns: Title, Status, Views, Applications, Posted Date, Actions

3. client/src/pages/employer/JobsPage.jsx:
   - Filter bar: All / Draft / Active / Paused / Closed / Expired
   - Job cards list: title, type badge, location, salary, views, applications count, status badge
   - Each card: Edit, Pause/Activate toggle, Close, View Applicants buttons
   - Empty state with "Post your first job" CTA

4. client/src/pages/employer/PostJobPage.jsx (multi-step form):
   Progress stepper at top: Step 1 → Step 2 → Step 3 → Step 4

   Step 1 — Basic Info:
   - Job Title (text input)
   - Department (optional text)
   - Category (select from API)
   - Employment Type (button group: Full-time / Part-time / Contract / Internship / Freelance)
   - Work Mode (button group: On-site / Remote / Hybrid)
   
   Step 2 — Details & Compensation:
   - Experience Level (button group: Entry / Mid / Senior / Lead / Executive)
   - Location Country (select), Location City (text)
   - "Open to candidates globally" checkbox
   - Salary Range: Min/Max number inputs, Currency select, Period (hourly/monthly/annual)
   - Application Deadline (date picker)
   - External Application URL (optional)
   
   Step 3 — Description & Requirements:
   - Job Description (rich textarea with basic formatting: bold, italic, bullets, numbered list)
   - Requirements (separate textarea)
   - Required Skills (same tag-input component as seeker profile, search API for skills)
   - Custom Screening Questions (add up to 5 questions with text inputs, can reorder)
   
   Step 4 — Preview & Publish:
   - Full preview of how the job will appear on public site
   - Show any incomplete/missing fields as warnings
   - Two buttons: "Save as Draft" and "Publish Now"
   - Show remaining quota (e.g., "3 of 10 job posts used")

   Navigation: Next / Back buttons between steps
   Save progress to localStorage on each step change (so refresh doesn't lose data)

5. client/src/pages/employer/ApplicantsPage.jsx (ATS Kanban Board):
   Install: @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

   Kanban columns: Applied | Reviewing | Shortlisted | Interview | Offer | Hired | Rejected
   Each column shows applicant count badge

   Applicant Card (draggable):
   - Avatar (initials fallback), Name, Headline
   - Applied date, Rating stars (1-5, clickable to rate)
   - Skills match chips (e.g., "React", "Node.js")
   - "View Profile" button

   Drag behavior:
   - Drag card from one column to another
   - On drop: call PUT /applicants/:id/stage API
   - Optimistic update: move card immediately, rollback on API error
   - Show "Notify candidate" confirm modal before moving to interview/offer/rejected

   Right panel (opens when clicking "View Profile"):
   - Full seeker profile with tabbed sections
   - Resume viewer: embed PDF using <iframe> or pdf.js
   - Application notes section: add/view internal notes
   - Email applicant form: subject + body + send button
   - Interview scheduler: date/time picker, duration, type

   Above Kanban: filter bar and export button

6. client/src/pages/employer/AnalyticsPage.jsx:
   - Date range picker (Last 7 days / 30 days / 3 months / Custom)
   - Cards: Total Views, Total Applications, Avg Conversion Rate, Avg Time to Hire
   - Line chart: Views vs Applications over time (Recharts)
   - Bar chart: Applications by stage
   - Job performance table: sortable by views/applications/conversion
   - Pie chart: Application sources (direct/job boards/referral)

7. client/src/pages/employer/CompanyPage.jsx:
   - Logo upload (drag-drop or click, preview immediately)
   - Company details form: name, tagline, website, industry, size, founded year
   - Description (rich textarea)
   - Culture & benefits (rich textarea)
   - Social links: LinkedIn, Twitter, Glassdoor
   - Photo gallery: upload up to 10 office photos
   - Preview mode toggle to see public view

ALSO CREATE:
- client/src/api/employerApi.js — all employer API calls
- client/src/hooks/useEmployer.js — React Query hooks
- client/src/components/employer/KanbanBoard.jsx — standalone Kanban component
- client/src/components/employer/ApplicantCard.jsx — draggable card
- client/src/components/employer/JobForm.jsx — multi-step form logic

Use Recharts for all charts. Show complete code for all files.
```

---

## Key Concepts to Learn

- **@dnd-kit** — modern drag-and-drop for React; `DndContext`, `useDraggable`, `useDroppable`; more performant than react-beautiful-dnd
- **Optimistic updates in React Query** — `onMutate` to update cache immediately, `onError` to rollback
- **Multi-step forms** — `useState` for current step; validate each step before allowing Next; persist to `localStorage`
- **Recharts** — `LineChart`, `BarChart`, `PieChart` with `ResponsiveContainer` for responsive sizing
- **PDF embed** — `<iframe src={resumeUrl} />` works for PDFs in most browsers; fallback to download link

---

## Validation Checklist

- [ ] Multi-step form saves progress on step navigation
- [ ] Job preview shows correctly before publishing
- [ ] Quota remaining displays correctly based on plan
- [ ] Kanban drag-drop moves applicant to new column
- [ ] Drag triggers API call and handles error with rollback
- [ ] Confirm modal appears before rejecting a candidate
- [ ] Analytics charts render with real data
- [ ] Company logo uploads and previews immediately

---

## Next Step
**Prompt 12 — Search & Filter Backend**
