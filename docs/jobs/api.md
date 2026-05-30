# Jobs — API Reference

---

## Public Job Endpoints

### GET /api/jobs

Browse active job listings with filters.

**Auth:** None (optional — enriches response with `is_saved` flag for authenticated seekers)

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Full-text keyword search |
| `location` | string | City or country filter |
| `job_type` | string | `full_time`, `part_time`, `contract`, `internship` |
| `work_mode` | string | `onsite`, `remote`, `hybrid` |
| `experience` | string | `entry`, `mid`, `senior`, `executive` |
| `salary_min` | integer | Minimum salary filter |
| `salary_max` | integer | Maximum salary filter |
| `category_id` | uuid | Job category filter |
| `sort` | string | `relevance` (default), `date`, `salary_asc`, `salary_desc` |
| `page` | integer | Default 1 |
| `limit` | integer | Default 20, max 50 |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "uuid",
        "slug": "senior-react-developer-at-techcorp-a3f9",
        "title": "Senior React Developer",
        "job_type": "full_time",
        "work_mode": "remote",
        "experience_level": "senior",
        "location_city": "New York",
        "location_country": "US",
        "salary_min": 120000,
        "salary_max": 160000,
        "published_at": "2026-05-01T00:00:00.000Z",
        "expires_at": "2026-05-31T00:00:00.000Z",
        "is_saved": false,
        "company": {
          "name": "TechCorp",
          "logo_url": "https://...",
          "slug": "techcorp"
        },
        "skills": ["React", "TypeScript", "Node.js"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 142,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### GET /api/jobs/:slug

Get full job detail by slug.

**Auth:** None

**Response 200:**
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "uuid",
      "slug": "...",
      "title": "Senior React Developer",
      "description": "Full HTML-safe job description...",
      "job_type": "full_time",
      "work_mode": "remote",
      "experience_level": "senior",
      "location_city": "New York",
      "location_country": "US",
      "salary_min": 120000,
      "salary_max": 160000,
      "currency": "USD",
      "application_deadline": "2026-05-25T00:00:00.000Z",
      "external_url": null,
      "views_count": 847,
      "applications_count": 23,
      "published_at": "2026-05-01T00:00:00.000Z",
      "company": { "name": "TechCorp", "logo_url": "...", "description": "..." },
      "skills": ["React", "TypeScript"],
      "category": { "id": "uuid", "name": "Engineering" },
      "is_saved": false,
      "has_applied": false
    }
  }
}
```

---

## Employer Job Endpoints

All routes require: `Authorization: Bearer <token>` + role `employer`

Base: `/api/employer/jobs`

### POST /api/employer/jobs

Create a new job listing.

**Request Body:**
```json
{
  "title": "Senior React Developer",
  "description": "...",
  "job_type": "full_time",
  "work_mode": "remote",
  "experience_level": "senior",
  "location_city": "New York",
  "location_country": "US",
  "salary_min": 120000,
  "salary_max": 160000,
  "currency": "USD",
  "application_deadline": "2026-06-01",
  "skills": ["React", "TypeScript", "Node.js"],
  "category_id": "uuid",
  "status": "draft",
  "external_url": null
}
```

**Response 201:** Created job object.

**Error 422:** `QUOTA_EXCEEDED` — plan limit reached.

---

### GET /api/employer/jobs

List all jobs for the employer.

**Query:** `status` (filter), `page`, `limit`

**Response 200:** Array of jobs with application counts.

---

### PUT /api/employer/jobs/:id

Update a job listing (partial updates supported).

**Response 200:** Updated job.

---

### PUT /api/employer/jobs/:id/status

Change job status.

**Request Body:** `{ "status": "active" | "paused" | "closed" }`

**Response 200:** Updated job.

---

### DELETE /api/employer/jobs/:id

Soft-delete (close) a job listing.

**Response 200:** `{ "message": "Job listing closed." }`

---

### GET /api/employer/jobs/:id/stats

Job performance analytics.

**Response 200:**
```json
{
  "data": {
    "views_count": 847,
    "applications_count": 23,
    "applications_by_stage": {
      "applied": 10, "reviewing": 5, "shortlisted": 4,
      "interview": 3, "offer": 1, "hired": 0, "rejected": 0
    },
    "daily_views": [{ "date": "2026-05-01", "count": 42 }],
    "daily_applications": [{ "date": "2026-05-01", "count": 3 }]
  }
}
```

---

## Seeker Application Endpoints

### POST /api/jobs/:jobId/apply

Apply to a job.

**Auth:** Bearer (seeker role)

**Request Body (multipart/form-data):**
```
resume: <file>           // optional if resume_id provided
resume_id: uuid          // optional if resume file provided
cover_letter: string     // optional
```

**Response 201:** `{ "message": "Application submitted.", "data": { "application": {...} } }`

**Error 409:** `ALREADY_APPLIED`

---

### GET /api/seeker/applications

List all applications for the current seeker.

**Auth:** Bearer (seeker)

**Response 200:** Array of applications with job details and current ATS stage.

---

## ATS Endpoints

### GET /api/employer/jobs/:jobId/applicants

Get all applicants for a job (grouped by stage).

**Auth:** Bearer (employer)

**Response 200:** `{ "data": { "stages": { "applied": [...], "reviewing": [...] } } }`

---

### PATCH /api/employer/applications/:applicationId/stage

Move applicant to a new ATS stage.

**Request Body:** `{ "stage": "interview", "note": "Strong candidate" }`

**Response 200:** Updated application.
