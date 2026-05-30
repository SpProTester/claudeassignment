# Analytics — Requirements

---

## Functional Requirements

### FR-ANALYTICS-001: Employer Job Analytics
- Employer SHALL see view count and application count for each job listing
- Employer SHALL see a daily views vs applications line chart for the last 30 days
- Employer SHALL see application stage breakdown (pie/funnel chart)
- Employer SHALL see their top 3 performing listings by application rate

### FR-ANALYTICS-002: Employer Overview Dashboard
- Employer dashboard SHALL show: total active jobs, total applications received (all time), pending review count, positions filled count
- Dashboard SHALL show applications received in the last 7 days as a sparkline

### FR-ANALYTICS-003: Admin Platform Analytics
- Admin SHALL see: total registered users (by role), total active jobs, daily new registrations (30d), daily applications (30d)
- Admin SHALL see top 10 searched keywords (from search_logs)
- Admin SHALL see top 10 categories by job count

### FR-ANALYTICS-004: Search Analytics
- System SHALL log every search query with keyword, filters, result count, and timestamp
- Zero-result queries SHALL be queryable by admin (to identify content gaps)

---

## Non-Functional Requirements

- Analytics queries MUST NOT run on primary write replicas during peak hours (use read replica in production)
- Expensive aggregations MUST be cached for 5 minutes
- Analytics data MUST be accurate to within 1 hour (eventual consistency acceptable)

---

## Acceptance Criteria

- [ ] Job stats endpoint returns correct daily trend arrays
- [ ] Employer dashboard shows accurate total application count
- [ ] Admin stats endpoint aggregates user counts by role
- [ ] Top searched keywords appear in admin analytics
