# Notifications — Frontend Flow

---

## Notification Bell

```
Navbar (all authenticated pages)
  └─ NotificationBell.jsx
       ├─ Bell icon with unread_count badge (red dot)
       ├─ Click → opens NotificationDropdown (popover)
       │   ├─ Notification list (latest 10)
       │   ├─ "Mark all as read" button
       │   └─ "See all" link → /notifications
       └─ Real-time update via Socket.IO:
             socket.on('notification:new', (notif) => {
               addNotificationToState(notif);
               incrementUnreadCount();
             })
```

## Notifications Page

```
/notifications
  ├─ Filter tabs: All / Unread
  ├─ Notification rows (type icon, title, message, time, read status)
  └─ "Mark all read" button
```

## Job Alerts Management

```
/seeker/alerts
  ↓
SeekerAlerts.jsx:
  ├─ List of existing alert subscriptions
  │   - Keywords, location, filters, active status
  │   - Toggle active/pause
  │   - Delete button
  └─ "+ Create Alert" modal:
       ├─ keywords input
       ├─ location input
       ├─ job_type, work_mode dropdowns
       ├─ salary_min input
       └─ Save → POST /api/seeker/alerts
```

## Socket.IO Client Setup

```javascript
// useSocket.js
const socket = io(VITE_SOCKET_URL, {
  auth: { token: accessToken },
  autoConnect: false,
});

useEffect(() => {
  socket.connect();
  socket.on('notification:new', handleNewNotification);
  return () => socket.disconnect();
}, [accessToken]);
```
