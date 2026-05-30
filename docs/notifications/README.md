# Notifications Module

> Real-time in-app notifications and job alert emails delivered to seekers and employers.

---

## Overview

The Notifications module delivers timely updates to users — both in-app (via Socket.IO) and via email (Nodemailer). It covers system-triggered events (application status changes, job expiry) and user-configured alerts (job alert subscriptions).

**Scope:**
- In-app notification bell with unread count
- Real-time push via Socket.IO
- Notification types: APPLICATION_STATUS, JOB_EXPIRED, JOB_ALERT_MATCH, PAYMENT_FAILED, SYSTEM
- Job alert subscriptions (seeker sets criteria; cron delivers matches)
- Mark read / mark all read / delete

---

## Key Files

| File | Responsibility |
|------|---------------|
| `server/src/services/notification.service.js` | Create + push notifications |
| `server/src/controllers/notifications.controller.js` | CRUD for notification list |
| `server/src/models/Notification.js` | Notification model |
| `server/src/models/JobAlert.js` | Job alert subscription model |
| `server/src/services/job-alert.cron.js` | Daily job alert email cron |
| `server/src/socket.js` | Socket.IO server setup |
| `client/src/hooks/useSocket.js` | Socket.IO client hook |
| `client/src/components/common/NotificationBell.jsx` | Bell icon with badge |
| `client/src/pages/seeker/SeekerAlerts.jsx` | Alert subscription management |

---

## Notification Types

| Type | Trigger | Recipients |
|------|---------|------------|
| `APPLICATION_STATUS` | ATS stage change | Seeker |
| `JOB_EXPIRED` | Cron — listing expired | Employer |
| `JOB_ALERT_MATCH` | Daily cron — new matching jobs | Seeker |
| `PAYMENT_FAILED` | Stripe webhook | Employer |
| `SYSTEM` | Admin broadcast | All / targeted |

---

## Related Docs

- [Requirements](requirements.md)
- [API Reference](api.md)
- [Database Schema](database-schema.md)
- [Frontend Flow](frontend-flow.md)
- [Backend Flow](backend-flow.md)
- [Test Cases](test-cases.md)
- [Jira Notes](jira-notes.md)
