# Admin — API Reference

Base path: `/api/admin` | Auth: Bearer + role `admin` or `super_admin`

---

## GET /api/admin/users

List all users.

**Query:** `q` (email/name search), `role`, `is_active`, `page`, `limit`

**Response 200:**
```json
{
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "full_name": "Jane Doe",
        "role": "employer",
        "is_active": true,
        "is_verified": true,
        "login_count": 42,
        "last_login_at": "2026-05-28T10:00:00.000Z",
        "created_at": "2026-01-15T00:00:00.000Z"
      }
    ],
    "pagination": { "total": 2847, "page": 1 }
  }
}
```

---

## PATCH /api/admin/users/:id/status

Activate or deactivate a user.

**Request Body:** `{ "is_active": false }`

**Response 200:** Updated user.

---

## GET /api/admin/jobs

List all job listings (all statuses).

**Query:** `status`, `employer_id`, `q`, `page`, `limit`

**Response 200:** Array of job listings.

---

## DELETE /api/admin/jobs/:id

Hard delete a job listing (moderation action).

**Response 200:** `{ "message": "Job listing removed." }`

---

## GET /api/admin/stats

Platform-wide statistics.

**Response 200:**
```json
{
  "data": {
    "users": { "total": 2847, "seekers": 2410, "employers": 437 },
    "jobs": { "active": 382, "total": 1240 },
    "applications": { "today": 84, "total": 18920 },
    "registrations_last_30d": [{ "date": "2026-05-01", "count": 12 }]
  }
}
```

---

## POST /api/admin/categories

Create a new job category. (Super Admin only)

**Request Body:** `{ "name": "DevOps", "slug": "devops", "icon_url": "..." }`

**Response 201:** Created category.

---

## POST /api/admin/broadcast

Send a system notification to all users or a specific role.

**Request Body:**
```json
{
  "target": "all",
  "title": "Scheduled Maintenance",
  "message": "The platform will be down on 2026-06-01 from 02:00–04:00 UTC."
}
```

**Response 200:** `{ "data": { "notified_count": 2847 } }`
