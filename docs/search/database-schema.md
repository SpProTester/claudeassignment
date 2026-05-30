# Search — Database Schema

---

## FTS Index on `job_listings`

The GIN index on the `tsvector` column powers full-text search.

Migration: `20240301000002-alter-job-listings-add-fts.cjs`

```sql
-- Add tsvector column (generated, persisted)
ALTER TABLE job_listings
  ADD COLUMN search_vector TSVECTOR
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(location_city, '') || ' ' ||
      coalesce(location_country, '')
    )
  ) STORED;

-- GIN index for fast FTS
CREATE INDEX idx_job_listings_fts
  ON job_listings USING GIN(search_vector);
```

---

## Table: `search_logs`

Tracks all search queries for analytics.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users(id), NULL (anonymous) |
| `keywords` | VARCHAR(255) | Raw search query |
| `filters` | JSONB | Applied filter parameters |
| `result_count` | INTEGER | Number of results returned |
| `session_id` | VARCHAR(100) | Anonymous session identifier |
| `created_at` | TIMESTAMPTZ | Query timestamp |

**Indexes:**
```sql
CREATE INDEX idx_search_logs_keywords ON search_logs(keywords);
CREATE INDEX idx_search_logs_created_at ON search_logs(created_at);
CREATE INDEX idx_search_logs_user_id ON search_logs(user_id);
```

---

## Table: `job_categories`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `name` | VARCHAR(100) | UNIQUE, e.g., "Engineering" |
| `slug` | VARCHAR(100) | UNIQUE |
| `icon_url` | TEXT | SVG/PNG icon |
| `job_count` | INTEGER | Cached active job count (refreshed hourly) |
| `sort_order` | INTEGER | Display order |

---

## FTS Query Pattern

```sql
SELECT jl.*, 
       ts_rank_cd(jl.search_vector, query) AS rank
FROM job_listings jl,
     plainto_tsquery('english', 'react developer') query
WHERE jl.search_vector @@ query
  AND jl.status = 'active'
  AND jl.expires_at > NOW()
ORDER BY rank DESC, jl.published_at DESC
LIMIT 20 OFFSET 0;
```
