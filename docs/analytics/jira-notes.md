# Analytics — Jira Notes

---

## Epic: JP-ANALYTICS — Analytics & Reporting

**Priority:** Medium | **Status:** Basic (live) / Advanced (planned Phase 9)

---

## Stories

### JP-ANALYTICS-001: Per-Job Stats (Basic)
**Points:** 3 | **Status:** Done

Views + applications count + stage breakdown.

### JP-ANALYTICS-002: Daily Trend Charts (Employer)
**Points:** 5 | **Status:** In Progress

Daily line chart for views vs applications per job listing.

### JP-ANALYTICS-003: Employer Overview Dashboard
**Points:** 3 | **Status:** Done (basic stats cards)

### JP-ANALYTICS-004: Admin Platform Analytics
**Points:** 5 | **Status:** Planned (Phase 6)

### JP-ANALYTICS-005: Search Trends
**Points:** 3 | **Status:** Planned

### JP-ANALYTICS-006: Advanced Funnel Analytics
**Points:** 8 | **Status:** Planned (Phase 9)

Track view → click "Apply" → submit application conversion funnel. Requires events table.

---

## Decisions

- **No separate analytics DB in MVP** — all queries run against the primary Postgres DB with appropriate indexes
- **Recharts** chosen for charts (lightweight, React-native, no licensing issues)
- **Data freshness**: analytics are real-time queries, not pre-aggregated materialized views (fine for MVP scale)
- At 1M+ jobs, will introduce materialized views or a TimescaleDB partition for time-series data
