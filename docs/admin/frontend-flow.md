# Admin — Frontend Flow

---

## Admin Dashboard Layout

```
/admin                        (RoleRoute: admin, super_admin only)
  └─ AdminLayout
       ├─ Sidebar: Dashboard | Users | Jobs | Companies | Analytics | Settings
       └─ Main content area

/admin/dashboard              → Stats cards + charts
/admin/users                  → User table with search/filter
/admin/users/:id              → User detail + actions
/admin/jobs                   → All jobs table
/admin/companies              → Company list with verify/ban
/admin/analytics              → Platform charts
/admin/settings/categories    → Category CRUD (super_admin)
```

---

## Stats Dashboard

```
AdminDashboard.jsx:
  ├─ Stat cards: Total Users | Active Jobs | Apps Today | MRR (Stripe)
  ├─ Line chart: User registrations (last 30 days)
  ├─ Bar chart: Applications per day (last 30 days)
  └─ Table: Top 10 job categories by listing count
```

---

## User Management

```
AdminUsers.jsx:
  ├─ Search bar (email/name)
  ├─ Role filter tabs: All | Seekers | Employers | Admins
  ├─ User table: email, name, role, status, last login, actions
  └─ Actions:
       - "Deactivate" → PATCH /api/admin/users/:id/status { is_active: false }
       - "Activate" → PATCH /api/admin/users/:id/status { is_active: true }
       - "View Profile" → /admin/users/:id
```

---

## Access Control

Admin pages are wrapped in `<RoleRoute role={['admin', 'super_admin']}>`. Employer and seeker users are redirected to their own dashboards.
