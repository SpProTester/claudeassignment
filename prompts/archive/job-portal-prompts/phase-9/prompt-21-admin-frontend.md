# Prompt 21 — Admin Frontend Dashboard

## Phase
Phase 9 — Admin Module

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
   - User Growth: Area chart (Recharts) — signups per day, last 30 days
   - Revenue Trend: Bar chart — daily revenue, last 30 days

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
   - Total Applications: 1,234 ↑ 12% vs last period
   - New Job Postings: 456 ↓ 3%
   - New Registrations: 789 ↑ 25%
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
   - [Process Refund] button per payment → confirm modal → call API

7. client/src/pages/admin/AuditLogPage.jsx (super_admin only):
   - Filter: by user, action type, date range
   - Table: timestamp, actor, action, entity type, entity ID
   - Expand row: shows old_values → new_values diff
   - Read-only, no actions

ALSO CREATE:
- client/src/api/adminApi.js — all admin API calls
- client/src/hooks/useAdmin.js — React Query hooks for admin data
```

---

## Key Concepts to Learn

- **Admin UX** — admin panels prioritize information density over visual beauty; tables with actions, filters, and bulk operations are core
- **Recharts** — `AreaChart`, `BarChart`, `PieChart`, `LineChart`; always wrap in `<ResponsiveContainer width="100%" height={300}>`
- **Confirmation patterns** — destructive actions (ban, delete) need confirmation modals; type-to-confirm for irreversible actions
- **Percentage change** — show period-over-period delta; `((current - previous) / previous) * 100`; green for positive, red for negative

---

## Validation Checklist

- [ ] KPI cards show real data from API
- [ ] User search by name/email works
- [ ] Suspend user → user can't log in, status badge changes
- [ ] Impersonate button only visible to super_admin
- [ ] Reject job sends email to employer with reason
- [ ] Revenue chart shows correct monthly data
- [ ] Audit log shows all admin actions with timestamps

---

## Next Step
**Prompt 22 — Security Hardening**
