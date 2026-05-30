# Companies — Database Schema

---

## Table: `employer_profiles` (extended view)

Company data is stored in `employer_profiles`. The following columns are relevant to the Companies module:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users(id), UNIQUE |
| `company_name` | VARCHAR(255) | NOT NULL |
| `company_slug` | VARCHAR(255) | UNIQUE, auto-generated |
| `industry` | VARCHAR(100) | e.g., "Technology", "Finance" |
| `company_size` | ENUM | `1-10`, `11-50`, `51-200`, `201-500`, `500+` |
| `founded_year` | INTEGER | NULL |
| `logo_url` | TEXT | CDN/S3 URL |
| `cover_url` | TEXT | Cover photo URL |
| `website_url` | TEXT | |
| `linkedin_url` | TEXT | |
| `description` | TEXT | Full company description |
| `culture_description` | TEXT | "Life at X" section |
| `headquarters_city` | VARCHAR(100) | |
| `headquarters_country` | VARCHAR(100) | |
| `profile_views` | INTEGER | DEFAULT 0 |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_employer_profiles_slug ON employer_profiles(company_slug);
CREATE INDEX idx_employer_profiles_industry ON employer_profiles(industry);
CREATE INDEX idx_employer_profiles_size ON employer_profiles(company_size);
```

---

## Relationships

```
employer_profiles ──< job_listings   (1:N — a company has many jobs)
employer_profiles ──  users          (1:1 — each employer has one profile)
```
