# Admin — Test Cases

---

## Integration Tests

### GET /api/admin/stats

```javascript
it('returns platform stats with correct counts', async () => {
  await seedUsers(10, { role: 'seeker' });
  await seedUsers(3, { role: 'employer' });
  const res = await adminAgent.get('/api/admin/stats');
  expect(res.status).toBe(200);
  expect(res.body.data.users.seekers).toBe(10);
  expect(res.body.data.users.employers).toBe(3);
});
```

### PATCH /api/admin/users/:id/status

```javascript
it('deactivates user and revokes all sessions', async () => {
  const user = await seedUser({ role: 'seeker' });
  await seedRefreshToken(user.id);
  await adminAgent.patch(`/api/admin/users/${user.id}/status`).send({ is_active: false });

  await user.reload();
  expect(user.is_active).toBe(false);

  const tokens = await RefreshToken.findAll({ where: { user_id: user.id, is_revoked: false } });
  expect(tokens).toHaveLength(0);
});

it('prevents admin from deactivating themselves', async () => {
  const res = await adminAgent.patch(`/api/admin/users/${admin.id}/status`).send({ is_active: false });
  expect(res.status).toBe(403);
});
```

### Authorization

```javascript
it('returns 403 for employer accessing admin routes', async () => {
  const res = await employerAgent.get('/api/admin/users');
  expect(res.status).toBe(403);
});

it('returns 401 for unauthenticated admin routes', async () => {
  const res = await request(app).get('/api/admin/users');
  expect(res.status).toBe(401);
});
```
