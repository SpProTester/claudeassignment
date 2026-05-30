# Search Module

> Full-text job search powered by PostgreSQL tsvector with faceted filters and search analytics.

---

## Overview

The Search module delivers fast, relevant job results to seekers. It uses PostgreSQL's built-in full-text search (FTS) engine with GIN indexes, supplemented by structured filters (job type, location, salary range). Search queries are logged for analytics and future relevance tuning.

**Scope:**
- Full-text keyword search over job title + description
- Multi-facet filters (type, mode, experience, salary, category, location)
- Sort by relevance (FTS rank), recency, or salary
- Autocomplete suggestions for job titles and skills
- Search query logging for analytics
- Seeker search history (last 10 searches)

**Future:** Elasticsearch migration when job count exceeds 100k.

---

## Key Files

| File | Responsibility |
|------|---------------|
| `server/src/controllers/job.search.controller.js` | FTS query builder + results |
| `server/src/models/SearchLog.js` | Search query analytics model |
| `server/src/models/JobCategory.js` | Category taxonomy |
| `client/src/pages/Jobs.jsx` | Search page (filters in URL params) |
| `client/src/hooks/useDebounce.js` | Debounce input before firing search |

---

## Search Architecture

```
User types in search bar
  ↓
useDebounce(query, 300ms)
  ↓
GET /api/jobs?q=...&filters...
  ↓
PostgreSQL FTS:
  WHERE to_tsvector('english', title || ' ' || description)
     @@ plainto_tsquery('english', :query)
  ORDER BY ts_rank_cd(tsvector_col, query) DESC
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
