# Admin Module

> Platform administration — user management, content moderation, system analytics, and configuration.

---

## Overview

The Admin module provides super-users with visibility and control over the entire platform. It is a restricted dashboard accessible only to users with `role = 'admin'` or `role = 'super_admin'`.

**Scope:**
- User management: view, activate/deactivate, change role
- Job listing moderation: review, approve, reject flagged listings
- Company verification management
- Platform-wide analytics dashboard
- System configuration (job categories, plan pricing)
- Audit log viewer

**Out of scope:** Code deployment, infrastructure management (handled via DevOps tools).

---

## Key Files

| File | Responsibility |
|------|---------------|
| `server/src/controllers/admin.controller.js` | Admin API handlers (to be created) |
| `server/src/routes/admin.routes.js` | Admin routes (to be created) |
| `client/src/pages/admin/AdminDashboard.jsx` | Admin dashboard (planned) |

---

## Access Control

```
role = 'admin'        → full admin panel access
role = 'super_admin'  → admin + system configuration
```

All admin routes use: `authenticateToken` + `authorizeRole('admin', 'super_admin')`

---

## Status

**Status:** In Progress (planned for Phase 6)

---

## Related Docs

- [Requirements](requirements.md)
- [API Reference](api.md)
- [Database Schema](database-schema.md)
- [Frontend Flow](frontend-flow.md)
- [Backend Flow](backend-flow.md)
- [Test Cases](test-cases.md)
- [Jira Notes](jira-notes.md)
