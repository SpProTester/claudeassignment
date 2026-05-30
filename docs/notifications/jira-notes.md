# Notifications — Jira Notes

---

## Epic: JP-NOTIF — Notifications & Alerts

**Priority:** High | **Status:** Production

---

## Stories

### JP-NOTIF-001: In-App Notification System
**Points:** 5 | **Status:** Done

### JP-NOTIF-002: Real-Time Socket.IO Push
**Points:** 3 | **Status:** Done

### JP-NOTIF-003: Job Alert Subscriptions
**Points:** 5 | **Status:** Done

### JP-NOTIF-004: Email Notifications
**Points:** 3 | **Status:** Done

---

## Known Limitations

- Socket.IO uses a single Node.js process; for multi-instance deployment, needs Redis adapter (`@socket.io/redis-adapter`)
- Job alert cron runs daily; no immediate alerts on new job post (would need event-driven approach with queues)
- No push notifications (browser native or FCM) — planned for mobile app phase
