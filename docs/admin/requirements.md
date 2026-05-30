# Admin — Requirements

---

## Functional Requirements

### FR-ADMIN-001: User Management
- Admin SHALL be able to list all users with search/filter by role, status, email
- Admin SHALL be able to activate or deactivate any user account
- Admin SHALL be able to view a user's profile, job listings, and applications
- Admin SHALL NOT be able to modify their own role (prevent privilege escalation)

### FR-ADMIN-002: Job Listing Moderation
- Admin SHALL be able to view all job listings (including draft and closed)
- Admin SHALL be able to remove a listing (hard delete) that violates platform rules
- Admin SHALL be able to mark a listing as "featured" regardless of plan

### FR-ADMIN-003: Company Management
- Admin SHALL be able to verify (badge) a company profile
- Admin SHALL be able to deactivate a company account

### FR-ADMIN-004: Platform Analytics
- Admin SHALL see a dashboard with: total users (by role), active job count, applications today, revenue (via Stripe API)
- Admin SHALL see a user registration trend chart (last 30 days)
- Admin SHALL see top 10 most popular job categories

### FR-ADMIN-005: System Configuration
- Super Admin SHALL be able to manage job categories (CRUD)
- Super Admin SHALL be able to broadcast a system notification to all users

---

## Non-Functional Requirements

- All admin actions SHALL be logged to an audit log (who, what, when)
- Admin panel MUST be inaccessible to seeker and employer roles (403)
- Admin panel MUST require 2FA in production (future)

---

## Acceptance Criteria

- [ ] Admin can deactivate a user → user cannot log in
- [ ] Admin can remove a job listing → listing disappears from public search immediately
- [ ] Admin dashboard shows accurate user and job counts
- [ ] Non-admin user accessing /admin/* receives 403
