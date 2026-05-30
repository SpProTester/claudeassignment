# Notifications — Backend Flow

---

## Notification Service

`server/src/services/notification.service.js`

```javascript
async function notify(userId, { type, title, message, link, metadata }) {
  // 1. Persist to DB
  const notification = await Notification.create({
    user_id: userId, type, title, message, link, metadata
  });

  // 2. Push via Socket.IO if user is online
  const io = getSocketIO();
  io.to(`user:${userId}`).emit('notification:new', notification.toJSON());

  // 3. Update unread count
  const unreadCount = await Notification.count({ where: { user_id: userId, is_read: false } });
  io.to(`user:${userId}`).emit('notification:count', { unread_count: unreadCount });

  return notification;
}
```

---

## Socket.IO Authentication

`server/src/socket.js`

```javascript
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const decoded = verifyAccessToken(token);
    socket.userId = decoded.userId;
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  socket.join(`user:${socket.userId}`);
  socket.on('disconnect', () => { /* cleanup */ });
});
```

---

## Job Alert Cron

`server/src/services/job-alert.cron.js`

```
Runs: '0 8 * * *' (08:00 UTC daily)
  │
  ├─ Load all active job_alerts
  ├─ For each alert:
  │   ├─ Build search query from alert.keywords, location, job_type, etc.
  │   ├─ Find jobs: status='active' AND published_at > alert.last_sent_at (or last 24h)
  │   ├─ If matching jobs found (max 10):
  │   │   ├─ emailService.sendJobAlertEmail(seeker.email, alert, jobs)
  │   │   └─ JobAlert.update({ last_sent_at: now })
  └─ Log: "Job alert cron: sent ${count} emails"
```

---

## API Handlers

```
GET /api/notifications
  → Notification.findAll({ where: { user_id }, order: [['created_at', 'DESC']], limit: 20 })

PATCH /api/notifications/:id/read
  → Notification.update({ is_read: true, read_at: now }, { where: { id, user_id } })

PATCH /api/notifications/read-all
  → Notification.update({ is_read: true, read_at: now }, { where: { user_id, is_read: false } })
```
