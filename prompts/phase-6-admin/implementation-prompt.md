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


# Prompt 21 â€” Admin Frontend Dashboard

## Phase
Phase 9 â€” Admin Module

## Objective
Build the admin panel UI with KPI dashboard, user management table, moderation queue, revenue analytics, and audit log.

---

## Prompt to Use

```
Build the Admin dashboard frontend in React with Tailwind CSS and Recharts.

1. client/src/layouts/AdminLayout.jsx:
   - Dark sidebar (slate-900) with admin-specific navigation
   - Links: Dashboard, Users, Jobs, Companies, Analytics, Revenue, Audit Log, Settings
   - Role check: only render for admin/super_admin
   - Admin badge in header
   - System health indicator (green/amber/red dot)

2. client/src/pages/admin/AdminDashboardPage.jsx:
   KPI Cards row (6 cards):
   - Total Users (with +N today chip)
   - Active Job Listings (with +N today chip)
   - Applications Today
   - Revenue This Month ($)
   - Flagged Content (alert color if > 0)
   - New Companies This Week

   Charts row:
   - User Growth: Area chart (Recharts) â€” signups per day, last 30 days
   - Revenue Trend: Bar chart â€” daily revenue, last 30 days

   Tables row:
   - Recent Signups table: name, email, role, joined date (last 10)
   - Flagged Jobs table: title, company, flag count, flag date, [Review] button

3. client/src/pages/admin/UsersPage.jsx:
   Filter bar:
   - Search input (name or email)
   - Role filter dropdown: All / Seeker / Employer / Admin
   - Status filter: All / Active / Suspended / Banned
   - Plan filter (for employers): All / Free / Professional / Business

   Data table:
   Columns: Avatar+Name | Email | Role badge | Status badge | Plan | Joined | Last Login | Actions

   Action dropdown per row:
   - View Profile (opens side panel)
   - Activate / Suspend / Ban (with confirmation + reason input)
   - Impersonate (super_admin only, with warning modal)
   - Delete Account (with "Type 'DELETE' to confirm" input)

   Side panel (sliding from right):
   - Full user profile info
   - Activity summary: total jobs/applications/payments
   - Login history (last 5)
   - Active sessions
   - Action buttons

4. client/src/pages/admin/JobModerationPage.jsx:
   Tabs: Flagged | All Jobs | Drafts | Expired

   Flagged jobs table:
   - Job title, Company, Posted date, Flag count, Flag reason
   - [Approve] [Reject] [Close] buttons
   - Reject opens modal: enter rejection reason (sent to employer)

   All jobs table:
   - Full searchable/filterable table of all jobs
   - Status filter, date range filter
   - Bulk actions: Approve Selected, Close Selected

5. client/src/pages/admin/AnalyticsPage.jsx:
   Date range picker at top (presets: 7d, 30d, 90d, 12m)

   Row 1: KPI cards (selected period vs previous period)
   - Total Applications: 1,234 â†‘ 12% vs last period
   - New Job Postings: 456 â†“ 3%
   - New Registrations: 789 â†‘ 25%
   - Jobs Filled (hired stage): 123

   Row 2:
   - Applications over time: Line chart
   - Registrations by role (Seeker vs Employer): Stacked bar chart

   Row 3:
   - Top Job Categories: Horizontal bar chart
   - Job Types distribution: Pie chart (Full-time vs Remote etc.)

   Row 4:
   - Top Employers (by applications received): table
   - Most Applied-to Jobs: table

6. client/src/pages/admin/RevenuePage.jsx:
   - MRR card, ARR card, Total Revenue card
   - Revenue by plan: Pie chart (Professional vs Business vs Enterprise)
   - Monthly revenue trend: Line chart (12 months)
   - Recent payments table: employer, plan, amount, date, status
   - Payment failures table (needs attention)
   - [Process Refund] button per payment â†’ confirm modal â†’ call API

7. client/src/pages/admin/AuditLogPage.jsx (super_admin only):
   - Filter: by user, action type, date range
   - Table: timestamp, actor, action, entity type, entity ID
   - Expand row: shows old_values â†’ new_values diff
   - Read-only, no actions

ALSO CREATE:
- client/src/api/adminApi.js â€” all admin API calls
- client/src/hooks/useAdmin.js â€” React Query hooks for admin data
```

---

## Key Concepts to Learn

- **Admin UX** â€” admin panels prioritize information density over visual beauty; tables with actions, filters, and bulk operations are core
- **Recharts** â€” `AreaChart`, `BarChart`, `PieChart`, `LineChart`; always wrap in `<ResponsiveContainer width="100%" height={300}>`
- **Confirmation patterns** â€” destructive actions (ban, delete) need confirmation modals; type-to-confirm for irreversible actions
- **Percentage change** â€” show period-over-period delta; `((current - previous) / previous) * 100`; green for positive, red for negative

---

## Validation Checklist

- [ ] KPI cards show real data from API
- [ ] User search by name/email works
- [ ] Suspend user â†’ user can't log in, status badge changes
- [ ] Impersonate button only visible to super_admin
- [ ] Reject job sends email to employer with reason
- [ ] Revenue chart shows correct monthly data
- [ ] Audit log shows all admin actions with timestamps

---

## Next Step
**Prompt 22 â€” Security Hardening**

