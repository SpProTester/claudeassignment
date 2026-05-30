# Analytics — Database Schema

---

## Data Sources

Analytics is primarily derived from existing tables. No separate analytics schema for MVP.

| Metric | Source Query |
|--------|-------------|
| Job views | `job_listings.views_count` (incremented on detail page load) |
| Applications | `SELECT COUNT(*) FROM applications WHERE job_id = ?` |
| Stage breakdown | `SELECT ats_stage, COUNT(*) FROM applications WHERE job_id = ? GROUP BY ats_stage` |
| Daily apps | `SELECT DATE(created_at), COUNT(*) FROM applications WHERE job_id = ? AND created_at > NOW() - INTERVAL '30 days' GROUP BY DATE(created_at)` |
| User registrations | `SELECT DATE(created_at), COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days' GROUP BY DATE(created_at) ORDER BY DATE(created_at)` |
| Search trends | `SELECT keywords, COUNT(*) FROM search_logs WHERE created_at > NOW() - INTERVAL '7 days' GROUP BY keywords ORDER BY COUNT(*) DESC LIMIT 10` |

---

## Table: `search_logs` (Analytics Source)

See [Search Schema](../search/database-schema.md) for full definition.

Key columns for analytics:
- `keywords` — groupable for trend analysis
- `result_count` — filter to 0 for content gap analysis
- `created_at` — time-series aggregation
- `filters` — JSONB — analyze popular filter combinations

---

## Future: Analytics Table (Phase 9)

For more granular analytics (page views per session, funnel drop-off), a dedicated `events` table will be introduced:

```sql
-- Planned
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,      -- 'JOB_VIEW', 'JOB_APPLY_CLICK', 'APPLY_COMPLETE'
  user_id UUID REFERENCES users(id),     -- NULL for anonymous
  session_id VARCHAR(100),
  job_id UUID REFERENCES job_listings(id),
  properties JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_job_id ON analytics_events(job_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
```
