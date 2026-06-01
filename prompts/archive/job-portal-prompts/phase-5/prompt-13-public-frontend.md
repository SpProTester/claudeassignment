# Prompt 13 — Public Frontend & Search UI

## Phase
Phase 5 — Search & Public Pages

## Objective
Build all public-facing pages: homepage, job search results with filters, job detail, and company profile — with URL-synced filters and skeleton loading.

---

## Prompt to Use

```
Build the public-facing pages for the Job Portal in React.

1. client/src/pages/public/HomePage.jsx:
   Hero Section:
   - Large headline: "Find Your Dream Job"
   - Subtitle text
   - Search form: keyword input + location input + "Search Jobs" button
   - Popular search tags below: "React Developer", "Product Manager", "Remote", etc.
   - Trending keywords from API

   Featured Companies row:
   - Horizontal scroll on mobile, grid on desktop
   - Company logo + name + open positions count
   - Click → company profile page

   Job Categories grid (3x3 on desktop):
   - Category icon (emoji or SVG), name, job count
   - Click → /jobs?category=:slug

   Recent Jobs list (6 cards):
   - JobCard component (reuse everywhere)
   - "View All Jobs" button at bottom

   Stats bar: "10,000+ Jobs", "5,000+ Companies", "1M+ Job Seekers"

2. client/src/components/shared/JobCard.jsx (reusable card):
   Props: job, showSaveButton (bool), onSave
   Content:
   - Company logo (fallback: company initials in colored circle)
   - Job title (link to /jobs/:slug)
   - Company name, location
   - Job type badge (Full-time/Remote/etc)
   - Salary range (if provided, else "Salary not disclosed")
   - Posted date (relative: "2 days ago")
   - Skills tags (first 3, "+N more" if more)
   - Save/unsave heart button (if showSaveButton)

3. client/src/pages/public/JobSearchPage.jsx:
   URL as source of truth for all filters — use useSearchParams()
   When filter changes: update URL params → trigger new API call

   Layout: sidebar filters (280px) + main results

   Sidebar Filters:
   - Keyword search input (debounced 500ms, updates URL)
   - Location input (debounced)
   - Job Type: checkboxes (Full-time, Part-time, Contract, Internship, Freelance)
   - Work Mode: checkboxes (On-site, Remote, Hybrid)
   - Experience Level: checkboxes (Entry, Mid, Senior, Lead, Executive)
   - Salary Range: dual-handle range slider (min/max)
   - Category: select dropdown from API
   - "Clear All Filters" button (only show if any filter active)

   Main Results:
   - Active filter tags row (each tag has X to remove that filter)
   - Results count: "1,432 jobs found"
   - Sort dropdown: Relevance / Date / Salary
   - Job cards list (one per row on mobile, large cards on desktop)
   - Skeleton cards while loading (3 placeholder cards)
   - Pagination: numbered pages, prev/next buttons
   - No results state: illustration + "Try different keywords" message

4. client/src/pages/public/JobDetailPage.jsx:
   Use slug from URL params to fetch job

   Left column (65%):
   - Job title, company name + verified badge
   - Meta row: location, job type badge, work mode badge, experience level
   - Salary range (formatted nicely)
   - Posted date + deadline (if set)
   - "Apply Now" sticky button (becomes fixed at bottom on mobile)
   - Tabs: [Description] [Requirements] [Company]
   - Description tab: rich text rendered safely (dangerouslySetInnerHTML with sanitization)
   - Requirements tab: same
   - Company tab: logo, description, culture, benefits, link to company page

   Right sidebar (35%):
   - Apply card: "Apply Now" button (modal if logged in, redirect to login if not)
   - Job overview: type, mode, experience, deadline, salary
   - Similar Jobs list (3-4 cards)
   - Share buttons (copy link, LinkedIn, Twitter)

   Apply Modal (for logged-in seekers):
   - Select resume dropdown (list seeker's resumes)
   - Cover letter textarea (optional)
   - Submit button with loading state
   - "Already applied" state if duplicate

5. client/src/pages/public/CompanyProfilePage.jsx:
   - Company banner (gradient if no cover photo)
   - Logo, company name, verified badge
   - Industry, size, founded, website link
   - About section (description)
   - Culture & Benefits section
   - Open Positions list (active jobs for this company, filterable)

6. client/src/components/shared/SearchBar.jsx (reusable):
   - Keyword input with autocomplete dropdown
   - Autocomplete: show jobs, companies, skills in grouped sections
   - Debounced call to /api/jobs/suggestions
   - Keyboard navigation (arrow up/down, enter to select)
   - Click outside to close dropdown

ALSO CREATE:
- client/src/api/publicApi.js — search, job detail, categories, etc.
- client/src/hooks/useJobs.js — React Query hooks for all public data
- client/src/utils/formatters.js — formatSalary, formatDate, formatRelativeTime

All pages must have proper <title> and meta description for SEO (use react-helmet-async).
Fully responsive: mobile-first design.
Skeleton loading states for all data-dependent sections.
```

---

## Key Concepts to Learn

- **URL as state** — `useSearchParams()` reads/writes URL query params; shareable/bookmarkable search results; browser back/forward works correctly
- **Debouncing** — `useDebounce` hook delays API call until user stops typing (500ms); prevents API spam on every keystroke
- **Autocomplete UX** — keyboard navigation with arrow keys; `aria-*` attributes for accessibility; close on outside click (`useEffect` + `mousedown` event)
- **react-helmet-async** — set `<title>` and `<meta>` tags dynamically for each page; important for SEO on public job pages
- **Relative time** — `date-fns` `formatDistanceToNow` shows "2 days ago"; cleaner than raw dates

---

## Validation Checklist

- [ ] Search results update when URL changes (paste a URL with filters → results match)
- [ ] Clearing filter tag removes it from URL and updates results
- [ ] Autocomplete shows grouped suggestions, navigable by keyboard
- [ ] Job detail shows apply modal for logged-in seekers
- [ ] Duplicate application shows "Already applied on [date]" state
- [ ] Company profile shows all open jobs
- [ ] All pages have custom `<title>` tags
- [ ] Mobile layout works for all pages

---

## Next Step
**Prompt 14 — Notification System**
