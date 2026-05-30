# Analytics — API Reference

---

## Employer Analytics

### GET /api/employer/jobs/:id/stats

Per-job analytics. See [Jobs API](../jobs/api.md#get-apiemployerjobsidstats) for full response.

---

### GET /api/employer/analytics/overview

Employer-level aggregated analytics.

**Auth:** Bearer (employer)

**Response 200:**
```json
{
  "data": {
    "total_active_jobs": 5,
    "total_applications": 284,
    "pending_review": 42,
    "hired": 3,
    "applications_last_7d": [
      { "date": "2026-05-24", "count": 8 },
      { "date": "2026-05-25", "count": 12 }
    ],
    "top_performing_jobs": [
      { "id": "uuid", "title": "Senior React Dev", "application_rate": 0.082 }
    ]
  }
}
```

---

## Admin Analytics

### GET /api/admin/stats

Platform statistics. See [Admin API](../admin/api.md#get-apiadminstats).

---

### GET /api/admin/analytics/search-trends

Top searched keywords and zero-result queries.

**Auth:** Bearer (admin)

**Query:** `period` (`7d`, `30d`, `90d`)

**Response 200:**
```json
{
  "data": {
    "top_keywords": [
      { "keyword": "react developer", "count": 342 },
      { "keyword": "python engineer", "count": 218 }
    ],
    "zero_result_keywords": [
      { "keyword": "cobol programmer", "count": 12 }
    ]
  }
}
```
