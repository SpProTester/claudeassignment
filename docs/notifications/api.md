# Notifications — API Reference

---

## GET /api/notifications

List notifications for the current user.

**Auth:** Bearer

**Query:** `unread_only=true`, `page`, `limit` (default 20)

**Response 200:**
```json
{
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "APPLICATION_STATUS",
        "title": "Application Update",
        "message": "Your application for Senior React Developer has moved to Interview.",
        "is_read": false,
        "link": "/seeker/applications",
        "created_at": "2026-05-30T10:00:00.000Z"
      }
    ],
    "unread_count": 3,
    "pagination": { "page": 1, "total": 12 }
  }
}
```

---

## PATCH /api/notifications/:id/read

Mark a single notification as read.

**Auth:** Bearer

**Response 200:** `{ "success": true }`

---

## PATCH /api/notifications/read-all

Mark all notifications as read.

**Auth:** Bearer

**Response 200:** `{ "success": true, "data": { "updated": 3 } }`

---

## DELETE /api/notifications/:id

Delete a notification.

**Auth:** Bearer

**Response 200:** `{ "success": true }`

---

## Job Alerts

### GET /api/seeker/alerts

List the current seeker's job alerts.

**Auth:** Bearer (seeker)

**Response 200:**
```json
{
  "data": {
    "alerts": [
      {
        "id": "uuid",
        "keywords": "react developer",
        "location": "remote",
        "job_type": "full_time",
        "salary_min": 80000,
        "is_active": true,
        "created_at": "2026-05-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### POST /api/seeker/alerts

Create a job alert.

**Auth:** Bearer (seeker)

**Request Body:**
```json
{
  "keywords": "react developer",
  "location": "remote",
  "job_type": "full_time",
  "work_mode": "remote",
  "salary_min": 80000
}
```

**Response 201:** Created alert.

---

### PATCH /api/seeker/alerts/:id

Update or toggle a job alert.

**Auth:** Bearer (seeker)

**Request Body:** Partial alert fields or `{ "is_active": false }` to pause.

---

### DELETE /api/seeker/alerts/:id

Delete a job alert.

**Auth:** Bearer (seeker)

**Response 200:** `{ "success": true }`

---

## Socket.IO Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `authenticate` | `{ token: string }` | Authenticate socket with JWT |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `notification:new` | Notification object | New notification pushed to user |
| `notification:count` | `{ unread_count: number }` | Updated unread count |
