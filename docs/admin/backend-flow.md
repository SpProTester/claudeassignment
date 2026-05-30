# Admin — Backend Flow

---

## Middleware Chain (All Admin Routes)

```
/api/admin/*
  ├─ authenticateToken     → verify JWT, attach req.user
  ├─ authorizeRole('admin', 'super_admin')  → 403 if wrong role
  ├─ auditLogger(action)   → log action to audit_logs after response
  └─ controller
```

---

## User Deactivation

```
PATCH /api/admin/users/:id/status { is_active: false }
  │
  ├─ Verify target user exists
  ├─ Prevent admin from deactivating themselves
  ├─ User.update({ is_active: false }, { where: { id: req.params.id } })
  ├─ RefreshToken.update({ is_revoked: true }, { where: { user_id } })
  │   (force logout of all sessions)
  ├─ auditLog({ admin_id: req.user.userId, action: 'USER_DEACTIVATED', target_id })
  └─ Response 200
```

---

## Platform Stats Query

```javascript
async function getStats(req, res) {
  const [userCounts, jobCount, appToday, registrations] = await Promise.all([
    User.findAll({
      attributes: ['role', [sequelize.fn('COUNT', '*'), 'count']],
      group: ['role'],
    }),
    JobListing.count({ where: { status: 'active' } }),
    Application.count({ where: { created_at: { [Op.gte]: startOfDay() } } }),
    User.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', '*'), 'count'],
      ],
      where: { created_at: { [Op.gte]: thirtyDaysAgo() } },
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
    }),
  ]);
  // Format and return
}
```

---

## Audit Logging Middleware

```javascript
function auditLogger(action) {
  return async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode < 400) {
        AuditLog.create({
          admin_id: req.user.userId,
          action,
          target_type: req.params.type || 'unknown',
          target_id: req.params.id || null,
          details: req.body,
          ip_address: req.ip,
        }).catch(err => logger.error('Audit log failed', err));
      }
    });
    next();
  };
}
```
