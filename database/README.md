# Database

> PostgreSQL schema management via Sequelize CLI migrations.

---

## Folder Structure

```
database/
├── migrations/     # Canonical SQL migration scripts (reference only)
├── schemas/        # ERD diagrams, schema reference documents
└── seeders/        # Seed data for development and testing
```

**Note:** The authoritative migration files used by the application are in `server/src/migrations/`. This folder contains canonical SQL versions and ERD documentation for reference.

---

## Database Setup

```bash
# Create databases
createdb jobportal_dev
createdb jobportal_test

# Run migrations (from server/ directory)
npm run db:migrate

# Seed development data
npm run db:seed

# Reset (undo all migrations, re-run, re-seed)
npm run db:reset
```

---

## Migration Naming Convention

```
YYYYMMDDHHMMSS-{verb}-{description}.cjs
```

Examples:
- `20240101000000-create-users.cjs`
- `20240201000013-alter-users-add-auth-fields.cjs`
- `20240301000002-alter-job-listings-add-fts.cjs`

**Rules:**
- Always use `.cjs` extension (project uses ES Modules in server)
- `create-` for new tables, `alter-` for modifications, `drop-` for removals
- Every migration MUST have an `up` AND `down` function
- Never modify a migration that has been applied to production

---

## Schema Reference

| Table | Description | Module |
|-------|-------------|--------|
| `users` | Core identity | Auth |
| `refresh_tokens` | Session management | Auth |
| `seeker_profiles` | Job seeker extended data | Auth/Seeker |
| `employer_profiles` | Employer/company data | Auth/Companies |
| `job_listings` | Job postings | Jobs |
| `job_skills` | Job ↔ Skill junction | Jobs |
| `skills` | Skill taxonomy | Jobs/Seeker |
| `seeker_skills` | Seeker ↔ Skill junction | Seeker |
| `applications` | Job applications with ATS stage | Jobs |
| `resumes` | Uploaded resume metadata | Seeker |
| `saved_jobs` | Seeker bookmarks | Jobs |
| `job_alerts` | Alert subscriptions | Notifications |
| `notifications` | In-app notification queue | Notifications |
| `job_categories` | Category taxonomy | Search/Jobs |
| `search_logs` | Search query analytics | Search |
| `billing_events` | Stripe event audit log | Payments |

---

## Entity Relationship Overview

```
users ──< seeker_profiles ──< applications >── job_listings >── employer_profiles
                          ──< seeker_skills >── skills
                          ──< saved_jobs >── job_listings
                          ──< resumes
                          ──< job_alerts

employer_profiles ──< job_listings >── job_skills >── skills
                                    >── job_categories

notifications ──> users
billing_events ──> employer_profiles
search_logs ──> users (optional)
```

---

## Production Guidelines

- **Never** run `sequelize.sync()` in production — use migrations only
- **Never** modify a migration that has run on production — create a new migration instead
- Always test the `down()` function before deploying to production
- Use connection pooling (max: 10, min: 2) — configured in `server/src/config/database.js`
- Enable SSL in production: `ssl: { require: true, rejectUnauthorized: false }`
