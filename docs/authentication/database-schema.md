# Authentication — Database Schema

---

## Table: `users`

Central identity table. All other profile tables reference this via foreign key.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Surrogate primary key |
| `email` | VARCHAR(320) | UNIQUE, NOT NULL | Login identifier |
| `password_hash` | VARCHAR(255) | NULL | bcrypt hash; NULL for OAuth-only users |
| `role` | ENUM | NOT NULL | `seeker`, `employer`, `admin` |
| `full_name` | VARCHAR(255) | NOT NULL | Display name |
| `avatar_url` | TEXT | NULL | Profile photo URL |
| `phone` | VARCHAR(20) | NULL | Optional contact number |
| `is_verified` | BOOLEAN | NOT NULL, DEFAULT false | Email verified flag |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Account enabled flag |
| `failed_login_attempts` | INTEGER | NOT NULL, DEFAULT 0 | Lockout counter |
| `lockout_until` | TIMESTAMPTZ | NULL | Lock expiry timestamp |
| `last_login_at` | TIMESTAMPTZ | NULL | Last successful login |
| `login_count` | INTEGER | NOT NULL, DEFAULT 0 | Total login count |
| `email_verify_token` | VARCHAR(255) | NULL | SHA-256 hash of verification token |
| `email_verify_expires` | TIMESTAMPTZ | NULL | Token expiry |
| `otp_hash` | VARCHAR(255) | NULL | SHA-256 hash of password reset OTP |
| `otp_expires` | TIMESTAMPTZ | NULL | OTP expiry |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
```

---

## Table: `refresh_tokens`

Stores hashed refresh tokens for revocation support.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → users(id) ON DELETE CASCADE | Token owner |
| `token_hash` | VARCHAR(255) | NOT NULL | SHA-256 hash of raw token |
| `expires_at` | TIMESTAMPTZ | NOT NULL | Token expiry (30 days from issue) |
| `is_revoked` | BOOLEAN | NOT NULL, DEFAULT false | Revoked flag |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
```sql
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
```

---

## Table: `seeker_profiles`

Extended profile for job seekers. Created automatically on registration.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users(id), UNIQUE |
| `headline` | VARCHAR(255) | Professional title (e.g., "Senior React Developer") |
| `bio` | TEXT | Short bio / summary |
| `location_city` | VARCHAR(100) | |
| `location_country` | VARCHAR(100) | |
| `years_of_experience` | INTEGER | |
| `expected_salary_min` | INTEGER | |
| `expected_salary_max` | INTEGER | |
| `resume_url` | TEXT | Active resume file URL |
| `linkedin_url` | TEXT | |
| `portfolio_url` | TEXT | |
| `profile_views` | INTEGER | DEFAULT 0 |
| `profile_completeness` | INTEGER | 0-100 score |
| `is_open_to_work` | BOOLEAN | DEFAULT true |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

---

## Table: `employer_profiles`

Extended profile for employer accounts.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users(id), UNIQUE |
| `company_name` | VARCHAR(255) | NOT NULL |
| `company_slug` | VARCHAR(255) | UNIQUE, auto-generated |
| `industry` | VARCHAR(100) | |
| `company_size` | ENUM | `1-10`, `11-50`, `51-200`, `201-500`, `500+` |
| `website_url` | TEXT | |
| `logo_url` | TEXT | |
| `description` | TEXT | |
| `subscription_plan` | ENUM | `free`, `professional`, `business`, `enterprise` |
| `job_post_limit` | INTEGER | Based on plan |
| `stripe_customer_id` | VARCHAR(255) | Stripe customer ID |
| `stripe_subscription_id` | VARCHAR(255) | Active Stripe subscription |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

---

## Entity Relationships

```
users ─┬─ seeker_profiles  (1:1, via user_id)
       ├─ employer_profiles (1:1, via user_id)
       └─ refresh_tokens    (1:N, via user_id)
```

---

## Migration Files

| Migration | Description |
|-----------|-------------|
| `20240101000000-create-users.cjs` | Base users table |
| `20240201000001-alter-users.cjs` | Add lockout, OTP, verify columns |
| `20240201000002-create-seeker-profiles.cjs` | Seeker profile table |
| `20240201000003-create-employer-profiles.cjs` | Employer profile table |
| `20240201000013-alter-users-add-auth-fields.cjs` | Add login_count, last_login_at |
