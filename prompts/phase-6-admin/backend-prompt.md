# Prompt 20 â€” Admin Backend

## Phase
Phase 9 â€” Admin Module

## Objective
Build admin panel APIs for user management, content moderation, platform analytics, refund processing, and audit logging.

---

## Prompt to Use

```
Build the Admin panel backend APIs for the Job Portal.

All routes protected by: authenticateToken + authorizeRole('admin', 'super_admin')
Base path: /api/admin

1. server/src/services/adminService.js:

   getUsers({ search, role, status, plan, page, limit, sortBy, sortOrder }):
   - Search by name or email (ILIKE)
   - Filter by role, is_active status, subscription_plan
   - Include: SeekerProfile OR EmployerProfile based on role
   - Return paginated users with their profile type

   updateUserStatus(adminId, userId, status, reason):
   - status: 'active' | 'suspended' | 'banned'
   - Update User.is_active
   - Create AuditLog entry
   - Send email to user about account status change
   - Return updated user

   impersonateUser(adminId, targetUserId):
   - SUPER_ADMIN only
   - Generate short-lived access token (30 min) with targetUser's identity
   - Add 'impersonated_by' field to token payload
   - Create AuditLog: { action: 'IMPERSONATE', entity_type: 'User', entity_id: targetUserId }
   - Return { accessToken, user } â€” frontend uses this token for impersonation session

   getFlaggedJobs({ page, limit }):
   - Jobs with status='flagged' OR flagged_count > 0
   - Include employer info
   - Return paginated list

   moderateJob(adminId, jobId, action, reason):
   - action: 'approve' | 'reject' | 'flag' | 'close'
   - Update job status accordingly
   - Create AuditLog
   - Notify employer

   getPlatformStats():
   - Total users: count by role
   - New users today / this week / this month
   - Active job listings count
   - Jobs posted today / this week
   - Total applications today / this week
   - Revenue: sum payments this month (from Payment model)
   - Top job categories by listing count
   - Return all stats in one response

   getRevenueStats({ period }): 
   - period: '7d' | '30d' | '90d' | '12m'
   - Return: { total_revenue, mrr, arr, 
     daily_revenue: [...], plan_breakdown: { free: 0, professional: N, business: N } }

   processRefund(adminId, paymentId, reason):
   - Find Payment record
   - Call stripe.refunds.create({ payment_intent: payment.stripe_payment_intent_id })
   - Update Payment.status = 'refunded'
   - Create AuditLog
   - Downgrade employer to free plan
   - Send refund confirmation email
   - Return { message, refund_id }

   getAuditLog({ userId, action, entity_type, startDate, endDate, page, limit }):
   - SUPER_ADMIN only
   - Filter by all params
   - Include actor user info
   - Return paginated audit entries

2. Auto-audit logging â€” create middleware:
   server/src/middleware/auditLogger.js:
   - After each admin action, create AuditLog automatically
   - Capture: user_id (from req.user), action (derive from method+path), 
     entity_type, entity_id, old_values, new_values, ip_address, user_agent
   - Log to Winston as well

3. server/src/routes/admin.js:
   GET  /users                    â†’ getUsers
   PUT  /users/:id/status         â†’ updateUserStatus
   POST /users/:id/impersonate    â†’ impersonateUser (super_admin only)
   GET  /jobs/flagged             â†’ getFlaggedJobs
   PUT  /jobs/:id/moderate        â†’ moderateJob
   GET  /stats                    â†’ getPlatformStats
   GET  /stats/revenue            â†’ getRevenueStats
   POST /payments/:id/refund      â†’ processRefund
   GET  /audit-log                â†’ getAuditLog (super_admin only)
   GET  /categories               â†’ CRUD for job categories
   POST /categories               â†’ createCategory
   PUT  /categories/:id           â†’ updateCategory
   DELETE /categories/:id         â†’ deleteCategory

4. Flag system for jobs:
   - Add flag_count(INTEGER 0) and flagged_reason(TEXT) to job_listings
   - Public route: POST /jobs/:id/flag â†’ { reason } â€” any logged-in user can flag
   - Increment flag_count; if flag_count >= 3: automatically set status='flagged'
   - Add to admin moderation queue

5. server/src/jobs/adminReportCron.js:
   - Daily at 6 AM: generate admin daily summary email
   - New users count, jobs posted, applications, revenue, errors count
   - Send to ADMIN_EMAIL env variable
```

---

## Key Concepts to Learn

- **Impersonation** â€” legitimate admin debugging tool; MUST be logged in audit trail with `impersonated_by`; token should be short-lived; ideally shown as banner in UI
- **Audit logs** â€” immutable record of all admin actions; use INSERT only, never UPDATE or DELETE audit records; keep separate from regular logs
- **Aggregation queries** â€” platform stats require careful query design; consider caching stats that are expensive to compute
- **Stripe refunds** â€” `stripe.refunds.create` requires the `payment_intent` ID; refunds can be partial or full; always update your DB after Stripe confirms

---

## Validation Checklist

- [ ] `GET /admin/users` with search param filters correctly
- [ ] Suspending user prevents their login (is_active=false check in auth)
- [ ] Impersonate creates short-lived token and audit log
- [ ] Refund processes in Stripe and updates DB
- [ ] Platform stats return accurate counts
- [ ] Audit log captures all admin actions with timestamp and IP
- [ ] Flag count â‰¥ 3 auto-moves job to flagged queue

---

## Next Step
**Prompt 21 â€” Admin Frontend Dashboard**

