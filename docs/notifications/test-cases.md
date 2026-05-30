# Notifications — Test Cases

---

## Unit Tests

### notificationService.notify

| Test | Expected |
|------|---------|
| User online | Notification created + socket event emitted |
| User offline | Notification created, no socket error thrown |
| DB error | Error propagated to caller |

---

## Integration Tests

### GET /api/notifications

```javascript
it('returns notifications sorted by created_at DESC', async () => {
  await seedNotifications(user, 5);
  const res = await authedAgent.get('/api/notifications');
  expect(res.body.data.notifications).toHaveLength(5);
  // Verify descending order
  const dates = res.body.data.notifications.map(n => new Date(n.created_at));
  for (let i = 1; i < dates.length; i++) {
    expect(dates[i - 1] >= dates[i]).toBe(true);
  }
});
```

### PATCH /api/notifications/read-all

```javascript
it('marks all unread as read', async () => {
  await seedNotifications(user, 3, { is_read: false });
  await authedAgent.patch('/api/notifications/read-all');
  const count = await Notification.count({ where: { user_id: user.id, is_read: false } });
  expect(count).toBe(0);
});
```

---

## Socket.IO Tests

```javascript
it('pushes notification to connected user', (done) => {
  const client = io(SERVER_URL, { auth: { token: accessToken } });
  client.on('connect', async () => {
    await notificationService.notify(user.id, {
      type: 'SYSTEM',
      title: 'Test',
      message: 'Hello!'
    });
  });
  client.on('notification:new', (notif) => {
    expect(notif.title).toBe('Test');
    client.disconnect();
    done();
  });
});
```

---

## Cron Test

```javascript
it('sends job alert email for matching jobs', async () => {
  const alert = await seedJobAlert(seeker, { keywords: 'react' });
  await seedJob({ title: 'React Developer', status: 'active' });
  await runJobAlertCron();
  expect(emailService.sendJobAlertEmail).toHaveBeenCalledWith(
    seeker.email, expect.objectContaining({ keywords: 'react' }), expect.any(Array)
  );
  await alert.reload();
  expect(alert.last_sent_at).not.toBeNull();
});
```
