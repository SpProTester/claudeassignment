# Notifications — Requirements

---

## Functional Requirements

### FR-NOTIF-001: In-App Notifications
- System SHALL create a notification record for each qualifying event
- System SHALL push the notification to the user's browser via Socket.IO if they are online
- Notification bell SHALL display unread count badge
- User SHALL be able to mark individual or all notifications as read
- User SHALL be able to delete notifications

### FR-NOTIF-002: Real-Time Delivery
- System SHALL use Socket.IO to push `notification:new` events to connected users
- User's socket room SHALL be their `user_id`
- System SHALL join the user's room on socket authentication (JWT in handshake)

### FR-NOTIF-003: Job Alert Subscriptions
- Authenticated seekers SHALL be able to create job alert subscriptions with criteria: keywords, location, job_type, work_mode, salary_min
- System SHALL run a daily cron to find new jobs matching each alert
- System SHALL send an email digest (max 10 jobs per alert per day) to the seeker
- Seeker SHALL be able to pause or delete their alerts

### FR-NOTIF-004: Email Notifications
- System SHALL send email for APPLICATION_STATUS changes to Interview, Offer, or Rejected
- System SHALL send email for JOB_EXPIRED to the posting employer
- System SHALL send email for PAYMENT_FAILED to the employer
- Emails SHALL be non-blocking (async, failures do not affect API response)

---

## Non-Functional Requirements

- Socket.IO connections SHALL be authenticated (reject handshakes without valid JWT)
- Email sending failures MUST be logged but MUST NOT throw errors to the caller
- Cron job MUST run at a consistent time (daily at 08:00 UTC) to avoid duplicate sends

---

## Acceptance Criteria

- [ ] ATS stage change → notification appears in bell within 3 seconds (if online)
- [ ] User marks all read → all badges cleared
- [ ] Job alert created → daily cron sends matching job email
- [ ] Offline user gets notification stored; sees it on next login
