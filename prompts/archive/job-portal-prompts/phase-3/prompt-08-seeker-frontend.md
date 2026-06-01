# Prompt 08 — Job Seeker Frontend Dashboard

## Phase
Phase 3 — Job Seeker Module

## Objective
Build the complete Job Seeker dashboard UI with profile editor (multi-section), resume management, application tracker, and saved jobs — all with React Query for data fetching and Tailwind CSS for styling.

---

## Prompt to Use

```
Build the Job Seeker dashboard in React. Use Tailwind CSS, React Query for all data fetching,
and React Hook Form for forms. No external UI libraries.

1. client/src/layouts/SeekerLayout.jsx:
   - Left sidebar (collapsible on mobile) with navigation links:
     Dashboard, My Profile, Resumes, Applications, Saved Jobs, Job Alerts, Settings
   - Each nav item has icon (lucide-react), label, and active state
   - Top header: search bar, notification bell with badge count, user avatar dropdown
   - Avatar dropdown: View Profile, Settings, Logout
   - Sidebar shows profile completion score as a progress ring
   - Main content area with padding

2. client/src/pages/seeker/DashboardPage.jsx:
   Stats row (4 cards):
   - Applied: number with blue bg
   - Shortlisted: number with purple bg  
   - Interviews: number with amber bg
   - Saved Jobs: number with green bg

   Below stats — 2 column layout:
   Left (60%): Recent Applications list
   - Each item: company logo placeholder, job title, company name, 
     applied date, status badge (color per stage), "View" link
   
   Right (40%): 
   - Profile Completion card: circular progress ring (SVG), percentage, 
     list of incomplete items with checkboxes
   - Recommended Jobs card: 3 job cards with title, company, location, quick apply button

3. client/src/pages/seeker/ProfilePage.jsx:
   Tabbed interface with 5 tabs:
   [Personal Info] [Experience] [Education] [Skills] [Preferences]

   Tab 1 — Personal Info:
   - Avatar upload (click to change, preview immediately)
   - Full Name, Headline, Email (read-only), Phone
   - Location (city, country), LinkedIn URL, Portfolio URL, GitHub URL
   - Professional Summary (textarea, 500 char limit with counter)
   - Save button with loading state

   Tab 2 — Work Experience:
   - List of experience cards (company, title, dates, description)
   - Each card has Edit and Delete buttons
   - "Add Experience" button opens modal/drawer
   - Modal form: Job Title, Company Name, Employment Type,
     Location, Start Date, End Date, "I currently work here" checkbox,
     Description (rich text area)

   Tab 3 — Education:
   - Same pattern: list + add modal
   - Fields: Degree, Field of Study, Institution, Start Year, End Year,
     "Currently studying" checkbox, Grade (optional)

   Tab 4 — Skills:
   - Tag-style skill selector
   - Search existing skills from API as user types
   - Click to add, click added skill to remove
   - Each added skill has proficiency selector (Beginner/Intermediate/Advanced/Expert)
   - Show current skills as colored tags with X to remove

   Tab 5 — Preferences:
   - Open to Work toggle (big green/grey switch)
   - Profile Visibility radio (Public / Employers Only / Private)
   - Expected Salary range (min/max number inputs with currency)
   - Notice Period (dropdown: Immediately, 1 week, 2 weeks, 1 month, 2 months, 3 months)
   - Job Type preferences (checkboxes: Full-time, Part-time, Contract, Freelance)

4. client/src/pages/seeker/ResumePage.jsx:
   Header: "My Resumes" + count + "Upload Resume" button
   
   Resume cards grid (2 columns):
   Each card shows:
   - File icon (PDF/Word based on mime type)
   - Resume label (editable inline)
   - File size and upload date
   - "Default" green badge if is_default
   - Parse status chip: Pending (grey) / Processing (blue spinner) / Parsed (green) / Failed (red)
   - Action buttons: Preview, Set as Default, Download, Delete
   
   Upload modal:
   - Drag & drop zone: dashed border, file icon, "Drop your resume here or click to browse"
   - Accepted formats text: "PDF, DOC, DOCX up to 10MB"
   - Label input field
   - Shows selected file name before upload
   - Upload progress bar
   - Error message if file rejected

5. client/src/pages/seeker/ApplicationsPage.jsx:
   Filter tabs: All | Applied | Reviewing | Shortlisted | Interview | Offer | Rejected
   
   Applications table/list:
   - Job Title (link to job detail)
   - Company name + logo
   - Applied date
   - Last updated date
   - ATS Stage badge (color coded)
   - Actions: View Details, Withdraw (only if stage = 'applied')
   
   Application detail modal (on "View Details"):
   - Job summary card
   - Timeline of stage changes with dates
   - Your submitted resume link
   - Cover letter preview
   - Withdraw button if applicable

6. client/src/pages/seeker/SavedJobsPage.jsx:
   Grid of saved job cards:
   - Job title, company, location, job type badge, salary range
   - Days remaining before expiry (red if < 7 days)
   - "Apply Now" button, "Remove" button (heart icon filled → unfilled)
   - Empty state: illustration + "No saved jobs yet. Start browsing!"

ALSO CREATE:
- client/src/api/seekerApi.js — all seeker API calls using axiosInstance
- client/src/hooks/useSeeker.js — React Query hooks (useProfile, useDashboard, useApplications, useResumes, useSavedJobs)

Show complete code for all components. All data via React Query (useQuery + useMutation).
Loading skeletons for all data-dependent sections.
```

---

## Key Concepts to Learn

- **React Query `useQuery`** — `queryKey` for caching, `queryFn` for fetching, auto-refetch on window focus, `isLoading/isError/data` states
- **React Query `useMutation`** — for POST/PUT/DELETE; `onSuccess` to invalidate queries and refresh UI; `onError` to show error toast
- **Query invalidation** — after updating profile, call `queryClient.invalidateQueries(['seeker-profile'])` to refetch
- **Optimistic updates** — update UI immediately before server confirms; rollback on error (good for "Save job" button)
- **File upload with Axios** — use `FormData`, set `Content-Type: multipart/form-data`, track progress with `onUploadProgress`
- **Tabs in React** — manage active tab with `useState`; use array of objects `[{ id, label, component }]` for clean implementation

---

## Component Patterns

```jsx
// React Query pattern
const { data: profile, isLoading } = useQuery({
  queryKey: ['seeker-profile'],
  queryFn: seekerApi.getProfile,
});

// Mutation with invalidation
const updateProfile = useMutation({
  mutationFn: seekerApi.updateProfile,
  onSuccess: () => {
    queryClient.invalidateQueries(['seeker-profile']);
    toast.success('Profile updated!');
  },
  onError: (err) => toast.error(err.response?.data?.error?.message),
});

// Usage
<button onClick={() => updateProfile.mutate(formData)}>
  {updateProfile.isPending ? 'Saving...' : 'Save'}
</button>
```

---

## Validation Checklist

- [ ] Dashboard loads stats from API
- [ ] Profile tabs navigate without page reload
- [ ] Profile updates save and reflect immediately
- [ ] Resume upload drag-and-drop works
- [ ] Application list shows correct color-coded badges
- [ ] Withdraw application removes it from "Applied" tab
- [ ] Saving a job adds it to saved jobs page
- [ ] Loading skeletons show while data fetches

---

## Next Step
**Prompt 09 — Employer Job Posting Backend**
