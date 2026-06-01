# Prompt 14 — Notification System (Real-Time)

## Phase
Phase 6 — Notifications & Alerts

## Objective
Build a real-time notification system using Socket.io with in-app notifications, email delivery, and a notification center UI component.

---

## Prompt to Use

```
Build the real-time notification system for the Job Portal.

BACKEND:

1. server/src/config/socket.js:
   - Initialize Socket.io on the HTTP server
   - CORS: allow only CLIENT_URL
   - Auth middleware for Socket.io:
     - Extract token from socket.handshake.auth.token
     - Verify JWT, attach user to socket
     - Disconnect unauthenticated connections
   - On connect: join user-specific room "user:{userId}"
   - On disconnect: log and clean up
   - Export io instance

2. server/src/services/notificationService.js:

   createNotification(userId, { type, title, body, metadata, sendEmail, emailData }):
   - Create Notification record in DB
   - Emit to socket room "user:{userId}": event 'new_notification' with notification data
   - If sendEmail=true: call appropriate email function based on type
   - Return created notification

   NOTIFICATION TYPES & EMAIL:
   - 'application_received' → employer: "New application for {jobTitle}" 
   - 'application_status_changed' → seeker: "Your application status changed to {stage}"
   - 'job_expiring_soon' → employer: "Job '{title}' expires in 3 days"
   - 'profile_viewed' → seeker: in-app only, no email
   - 'payment_success' → email + in-app
   - 'payment_failed' → email + in-app (urgent)
   - 'job_alert_match' → email + in-app
   - 'interview_scheduled' → email + in-app + optional SMS
   - 'account_security' → email + in-app (always)

   getUserNotifications(userId, { page, limit, unread_only }):
   - Paginated list, newest first
   - Include unread count in response

   markAsRead(userId, notificationId):
   - Verify ownership
   - Set is_read=true, read_at=NOW()

   markAllAsRead(userId):
   - Update all user's unread notifications

   deleteNotification(userId, notificationId):
   - Verify ownership, delete

   getUnreadCount(userId):
   - COUNT where is_read=false

3. Integrate notificationService throughout the app:
   In atsService.updateStage: call createNotification for seeker
   In authService.register (employer): welcome notification
   In jobService: job expiry notification 3 days before (add to cron)
   In paymentService: payment success/failure

4. server/src/routes/notifications.js (protected):
   GET    /                → getUserNotifications
   GET    /unread-count    → getUnreadCount
   PUT    /:id/read        → markAsRead
   PUT    /read-all        → markAllAsRead
   DELETE /:id             → deleteNotification

FRONTEND:

5. client/src/hooks/useSocket.js:
   - Initialize Socket.io client (socket.io-client)
   - Connect on mount with auth: { token: accessToken }
   - Disconnect on unmount
   - Listen for 'new_notification' event
   - On new notification: update Zustand notification store + show toast
   - Handle reconnection automatically
   - Return socket instance

6. client/src/store/notificationStore.js (Zustand):
   State: notifications[], unreadCount, isLoading
   Actions: setNotifications, addNotification, markRead, markAllRead, 
           deleteNotification, setUnreadCount, incrementUnread

7. client/src/components/shared/NotificationBell.jsx:
   - Bell icon button with unread count badge (red dot, number inside)
   - Click → opens dropdown panel
   - Dropdown: "Notifications" header + "Mark all read" link
   - List of NotificationItem components (max 10 in dropdown)
   - "View all notifications" link → /notifications page
   - Close on outside click
   - Real-time badge update when new notification arrives

8. client/src/components/shared/NotificationItem.jsx:
   - Icon based on notification type (colored)
   - Title (bold if unread)
   - Body text (truncated at 2 lines)
   - Relative time ("2 min ago")
   - Unread indicator (blue dot on left)
   - Click: mark as read + navigate to relevant page based on type
   - Hover: show delete button

9. client/src/pages/shared/NotificationsPage.jsx:
   - Full page list of all notifications
   - Filter tabs: All / Unread / Applications / Jobs / Payments
   - "Mark all as read" button
   - Infinite scroll or pagination
   - Empty state

Show all files with complete code.
```

---

## Key Concepts to Learn

- **Socket.io rooms** — `socket.join("user:123")` puts socket in a named room; `io.to("user:123").emit(...)` sends only to that user's connections; handles multi-tab correctly
- **Socket.io auth** — middleware `io.use((socket, next) => { ... })` runs before every connection; attach user data to socket object
- **Pub/Sub pattern** — notification service publishes events; socket server delivers to connected clients; email service sends async
- **Zustand + socket** — update Zustand store from socket event listener; React components auto-rerender because they subscribe to store
- **Toast notifications** — use `react-hot-toast` for non-intrusive popups when new notification arrives via socket

---

## Validation Checklist

- [ ] Applying to a job → employer's bell shows new notification badge immediately
- [ ] ATS stage change → seeker gets in-app notification in real-time
- [ ] Notification badge shows correct unread count
- [ ] Clicking notification marks it as read and navigates to relevant page
- [ ] "Mark all read" clears badge to 0
- [ ] Notifications persist after page refresh (loaded from API, not just socket)
- [ ] Multiple browser tabs show same unread count (Socket.io rooms)

---

## Next Step
**Prompt 15 — Job Alerts System**
