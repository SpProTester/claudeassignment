# Search — Frontend Flow

---

## Search Flow

```
Home page hero search bar
  User types keyword + optional location
  Clicks "Search" → navigate to /jobs?q=react&location=remote
  ↓
Jobs.jsx mounts
  Reads URL params → builds filter state
  Calls GET /api/jobs with params
  Renders JobCard list
  ↓
User modifies filters:
  Selects "Full Time" → adds job_type=full_time to URL
  Sets salary range → adds salary_min/salary_max to URL
  All filter changes update URL (replaceState, not pushState)
  Each URL change triggers new API call
```

## Filter Sidebar State

```javascript
// All state lives in URL params — fully shareable
const [searchParams, setSearchParams] = useSearchParams();

const filters = {
  q: searchParams.get('q') || '',
  location: searchParams.get('location') || '',
  job_type: searchParams.get('job_type') || '',
  work_mode: searchParams.get('work_mode') || '',
  experience_level: searchParams.get('experience_level') || '',
  salary_min: searchParams.get('salary_min') || '',
  salary_max: searchParams.get('salary_max') || '',
  category_id: searchParams.get('category_id') || '',
  sort: searchParams.get('sort') || 'relevance',
  page: parseInt(searchParams.get('page') || '1'),
};

// Debounce keyword changes before firing API call
const debouncedQ = useDebounce(filters.q, 300);
```

## Autocomplete

```
Search bar input field
  User types 2+ chars
  useDebounce(300ms)
  GET /api/search/autocomplete?q=rea
  Renders suggestion dropdown:
    - "React Developer" (title)
    - "React" (skill)
    - "React Native Engineer" (title)
  User clicks suggestion → populates search input + submits
```

## Category Browse

```
Home page category grid
  GET /api/search/categories
  Renders category cards with icons and job counts
  Click "Engineering" → navigate to /jobs?category_id=uuid
```
