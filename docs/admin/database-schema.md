# Admin — Database Schema

---

## Relevant Existing Tables

Admin operations primarily read from and write to existing tables (`users`, `job_listings`, `employer_profiles`). The admin module adds:

---

## Table: `audit_logs` (Planned)

Every admin action is recorded for accountability.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `admin_id` | UUID | FK → users(id) — who performed the action |
| `action` | VARCHAR(100) | e.g., `USER_DEACTIVATED`, `JOB_REMOVED`, `BROADCAST_SENT` |
| `target_type` | VARCHAR(50) | `user`, `job`, `company`, `system` |
| `target_id` | UUID | ID of the affected record |
| `details` | JSONB | Before/after state or action parameters |
| `ip_address` | VARCHAR(45) | Admin's IP |
| `created_at` | TIMESTAMPTZ | |

**Indexes:**
```sql
CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

---

## Notes on Existing Schema

- User deactivation: `users.is_active = false`
- Job removal: hard delete (no soft delete for admin actions)
- Company verification: `employer_profiles.is_verified = true` (column to be added)
- Admin role stored in `users.role` = `'admin'` or `'super_admin'`
