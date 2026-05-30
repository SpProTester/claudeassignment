# Jobs — Database Schema

---

## Table: `job_listings`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `employer_id` | UUID | FK → employer_profiles(id) | Owning employer |
| `category_id` | UUID | FK → job_categories(id), NULL | Job category |
| `title` | VARCHAR(255) | NOT NULL | Job title |
| `slug` | VARCHAR(300) | UNIQUE, NOT NULL | URL-safe identifier |
| `description` | TEXT | NOT NULL | HTML-safe description |
| `job_type` | ENUM | NOT NULL | `full_time`, `part_time`, `contract`, `internship`, `freelance` |
| `work_mode` | ENUM | NOT NULL | `onsite`, `remote`, `hybrid` |
| `experience_level` | ENUM | NOT NULL | `entry`, `mid`, `senior`, `lead`, `executive` |
| `location_city` | VARCHAR(100) | NULL | |
| `location_state` | VARCHAR(100) | NULL | |
| `location_country` | VARCHAR(100) | NULL | |
| `salary_min` | INTEGER | NULL | Annual, in currency units |
| `salary_max` | INTEGER | NULL | |
| `currency` | VARCHAR(3) | DEFAULT 'USD' | ISO 4217 |
| `salary_disclosed` | BOOLEAN | DEFAULT true | Hide salary if false |
| `status` | ENUM | NOT NULL, DEFAULT 'draft' | `draft`, `active`, `paused`, `closed`, `expired` |
| `external_url` | TEXT | NULL | External application link |
| `application_deadline` | TIMESTAMPTZ | NULL | |
| `views_count` | INTEGER | DEFAULT 0 | |
| `applications_count` | INTEGER | DEFAULT 0 | Cached count |
| `published_at` | TIMESTAMPTZ | NULL | First activation timestamp |
| `expires_at` | TIMESTAMPTZ | NULL | Auto-expire date |
| `deleted_at` | TIMESTAMPTZ | NULL | Soft delete |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
```sql
CREATE INDEX idx_job_listings_status ON job_listings(status);
CREATE INDEX idx_job_listings_employer_id ON job_listings(employer_id);
CREATE INDEX idx_job_listings_published_at ON job_listings(published_at DESC);
CREATE INDEX idx_job_listings_expires_at ON job_listings(expires_at);
CREATE INDEX idx_job_listings_fts ON job_listings USING GIN(to_tsvector('english', title || ' ' || description));
```

---

## Table: `applications`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `job_id` | UUID | FK → job_listings(id) |
| `seeker_id` | UUID | FK → seeker_profiles(id) |
| `resume_url` | TEXT | Submitted resume URL |
| `cover_letter` | TEXT | Optional cover letter |
| `ats_stage` | ENUM | `applied`, `reviewing`, `shortlisted`, `interview`, `offer`, `hired`, `rejected` |
| `stage_notes` | TEXT | Internal recruiter notes |
| `stage_updated_at` | TIMESTAMPTZ | Last stage change timestamp |
| `is_withdrawn` | BOOLEAN | DEFAULT false |
| `created_at` | TIMESTAMPTZ | Application submission time |
| `updated_at` | TIMESTAMPTZ | |

**Constraints:**
```sql
UNIQUE(job_id, seeker_id)  -- prevent duplicate applications
```

**Indexes:**
```sql
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_seeker_id ON applications(seeker_id);
CREATE INDEX idx_applications_ats_stage ON applications(ats_stage);
```

---

## Table: `skills`

Master skills taxonomy.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `name` | VARCHAR(100) | UNIQUE, e.g., "React", "Python" |
| `slug` | VARCHAR(100) | UNIQUE, e.g., "react", "python" |
| `category` | VARCHAR(100) | e.g., "Frontend", "Backend", "DevOps" |

---

## Table: `job_skills`

Many-to-many: jobs ↔ skills.

| Column | Type | Description |
|--------|------|-------------|
| `job_id` | UUID | FK → job_listings(id) |
| `skill_id` | UUID | FK → skills(id) |

**Primary Key:** `(job_id, skill_id)`

---

## Table: `saved_jobs`

Seeker bookmarks.

| Column | Type | Description |
|--------|------|-------------|
| `seeker_id` | UUID | FK → seeker_profiles(id) |
| `job_id` | UUID | FK → job_listings(id) |
| `created_at` | TIMESTAMPTZ | |

**Primary Key:** `(seeker_id, job_id)`

---

## Table: `job_categories`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `name` | VARCHAR(100) | UNIQUE, e.g., "Engineering", "Design" |
| `slug` | VARCHAR(100) | UNIQUE |
| `icon_url` | TEXT | Category icon |
| `job_count` | INTEGER | Cached active job count |

---

## Entity Relationships

```
employer_profiles ──< job_listings >──< job_skills >── skills
                         │
                         ├──< applications >── seeker_profiles
                         │
                         └── job_categories

seeker_profiles ──< saved_jobs >── job_listings
```
