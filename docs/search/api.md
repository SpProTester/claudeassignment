# Search — API Reference

---

## GET /api/jobs (Search)

The primary job search endpoint. See [Jobs API](../jobs/api.md) for full request/response documentation.

Key search-specific parameters:

| Param | Description |
|-------|-------------|
| `q` | Full-text keywords (uses PostgreSQL `plainto_tsquery`) |
| `sort` | `relevance` (default when q provided), `date`, `salary_asc`, `salary_desc` |

---

## GET /api/search/autocomplete

Job title and skill autocomplete suggestions.

**Auth:** None

**Query Parameters:** `q` (min 2 chars), `type` (`titles` or `skills`, default both)

**Response 200:**
```json
{
  "data": {
    "suggestions": [
      { "type": "title", "value": "React Developer" },
      { "type": "title", "value": "React Native Engineer" },
      { "type": "skill", "value": "React" },
      { "type": "skill", "value": "React Testing Library" }
    ]
  }
}
```

**Performance:** Results cached in memory for 5 minutes per prefix.

---

## GET /api/search/categories

List all job categories with active job counts.

**Auth:** None

**Response 200:**
```json
{
  "data": {
    "categories": [
      { "id": "uuid", "name": "Engineering", "slug": "engineering", "job_count": 142 },
      { "id": "uuid", "name": "Design", "slug": "design", "job_count": 38 }
    ]
  }
}
```

---

## GET /api/search/trending

Top 10 most-searched keywords in the last 7 days.

**Auth:** None

**Response 200:**
```json
{
  "data": {
    "trending": [
      { "keyword": "react developer", "count": 342 },
      { "keyword": "python engineer", "count": 218 }
    ]
  }
}
```
