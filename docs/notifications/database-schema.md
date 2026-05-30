# Notifications — Database Schema

---

## Table: `notifications`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users(id) ON DELETE CASCADE |
| `type` | VARCHAR(50) | `APPLICATION_STATUS`, `JOB_EXPIRED`, `JOB_ALERT_MATCH`, `PAYMENT_FAILED`, `SYSTEM` |
| `title` | VARCHAR(255) | Short title |
| `message` | TEXT | Full notification message |
| `link` | VARCHAR(500) | Optional deep-link URL |
| `is_read` | BOOLEAN | DEFAULT false |
| `read_at` | TIMESTAMPTZ | NULL |
| `metadata` | JSONB | Extra context (job_id, application_id, etc.) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |

**Indexes:**
```sql
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

---

## Table: `job_alerts`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `seeker_id` | UUID | FK → seeker_profiles(id) |
| `keywords` | VARCHAR(255) | Full-text search keywords |
| `location` | VARCHAR(100) | City, country, or "remote" |
| `job_type` | VARCHAR(50) | NULL = any |
| `work_mode` | VARCHAR(50) | NULL = any |
| `experience_level` | VARCHAR(50) | NULL = any |
| `salary_min` | INTEGER | NULL = no minimum |
| `is_active` | BOOLEAN | DEFAULT true |
| `last_sent_at` | TIMESTAMPTZ | Last email sent timestamp |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**Indexes:**
```sql
CREATE INDEX idx_job_alerts_seeker_id ON job_alerts(seeker_id);
CREATE INDEX idx_job_alerts_is_active ON job_alerts(is_active);
```
