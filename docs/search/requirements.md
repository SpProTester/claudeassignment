# Search — Requirements

---

## Functional Requirements

### FR-SEARCH-001: Full-Text Search
- System SHALL support keyword search over job title and description
- Search SHALL be case-insensitive and handle common English stop words
- Search SHALL rank results by relevance (ts_rank) when a keyword is provided
- Empty keyword search SHALL return all active jobs sorted by published_at DESC

### FR-SEARCH-002: Faceted Filters
- System SHALL support combining multiple filters in a single request:
  - `job_type`: full_time, part_time, contract, internship, freelance
  - `work_mode`: onsite, remote, hybrid
  - `experience_level`: entry, mid, senior, lead, executive
  - `location`: city/country text match OR `work_mode=remote`
  - `salary_min` / `salary_max`: numeric range
  - `category_id`: job category UUID
- Filters SHALL be combinable (AND logic)
- Active filter count SHALL be displayed on the filter panel

### FR-SEARCH-003: Sort Options
- System SHALL support sorting by: relevance, date (newest first), salary ascending, salary descending

### FR-SEARCH-004: Pagination
- Default page size: 20 | Max: 50
- Response MUST include: `total`, `totalPages`, `hasNext`, `hasPrev`

### FR-SEARCH-005: Search Logging
- Every search query SHALL be logged to `search_logs` (keyword, filters, result_count, user_id if authed)
- Logs SHALL be used for analytics: top keywords, zero-result searches

### FR-SEARCH-006: Autocomplete
- System SHALL suggest job titles and skills matching a prefix (min 2 chars)
- Suggestions SHALL return within 100ms

---

## Non-Functional Requirements

- Search endpoint MUST return results within 500ms (p95) for FTS queries on 50k+ jobs
- GIN index MUST be maintained on the `tsvector` column for performance
- Search logs MUST NOT block the search response (async insert)

---

## Acceptance Criteria

- [ ] Searching "react" returns jobs with "React" in title or description
- [ ] Filtering by job_type=contract shows only contract roles
- [ ] Combining keyword + job_type + work_mode returns correct intersection
- [ ] Zero-result queries log to search_logs with result_count=0
- [ ] Pagination: page 2 returns correct offset slice
