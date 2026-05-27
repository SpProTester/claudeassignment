-- =============================================================================
-- Migration: 20260101000000_initial_schema
-- Purpose: Core tables — users, companies, job listings, applications
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE user_role AS ENUM ('job_seeker', 'employer', 'admin', 'super_admin');
CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'freelance');
CREATE TYPE experience_level AS ENUM ('entry', 'junior', 'mid', 'senior', 'lead', 'executive');
CREATE TYPE work_mode AS ENUM ('onsite', 'remote', 'hybrid');
CREATE TYPE company_size AS ENUM ('1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+');
CREATE TYPE content_status AS ENUM ('active', 'inactive', 'pending', 'archived');
CREATE TYPE application_status AS ENUM (
  'draft', 'submitted', 'under_review', 'shortlisted',
  'interview_scheduled', 'interview_completed',
  'offer_extended', 'offer_accepted', 'offer_declined',
  'rejected', 'withdrawn'
);
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'trialing', 'paused');
CREATE TYPE plan_tier AS ENUM ('free', 'starter', 'professional', 'enterprise');
CREATE TYPE billing_interval AS ENUM ('monthly', 'annual');
CREATE TYPE payment_provider AS ENUM ('stripe', 'razorpay');
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'sms', 'push');
CREATE TYPE interview_type AS ENUM ('phone', 'video', 'onsite', 'technical', 'panel');
CREATE TYPE interview_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE employer_team_role AS ENUM ('owner', 'admin', 'recruiter', 'hiring_manager', 'viewer');

-- =============================================================================
-- USER PROFILES (extends Supabase Auth users)
-- =============================================================================

CREATE TABLE user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role          user_role NOT NULL DEFAULT 'job_seeker',
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  avatar_url    TEXT,
  phone         TEXT,
  timezone      TEXT NOT NULL DEFAULT 'UTC',
  locale        TEXT NOT NULL DEFAULT 'en',
  is_mfa_enabled BOOLEAN NOT NULL DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('admin', 'super_admin')
    )
  );

-- =============================================================================
-- COMPANIES
-- =============================================================================

CREATE TABLE companies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID NOT NULL REFERENCES auth.users(id),
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  description       TEXT,
  logo_url          TEXT,
  cover_image_url   TEXT,
  website           TEXT,
  industry          TEXT NOT NULL,
  company_size      company_size NOT NULL DEFAULT '1-10',
  founded_year      SMALLINT CHECK (founded_year > 1800 AND founded_year <= EXTRACT(YEAR FROM now())),
  headquarters      TEXT,
  country           TEXT NOT NULL,
  is_verified       BOOLEAN NOT NULL DEFAULT false,
  status            content_status NOT NULL DEFAULT 'active',
  followers_count   INT NOT NULL DEFAULT 0,
  active_job_count  INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active companies"
  ON companies FOR SELECT
  USING (status = 'active');

CREATE POLICY "Company owners can manage their company"
  ON companies FOR ALL
  USING (auth.uid() = owner_id);

CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_owner ON companies(owner_id);
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_name_trgm ON companies USING gin(name gin_trgm_ops);

-- =============================================================================
-- EMPLOYER TEAM MEMBERS
-- =============================================================================

CREATE TABLE employer_team_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id),
  role         employer_team_role NOT NULL DEFAULT 'viewer',
  invited_by   UUID REFERENCES auth.users(id),
  invited_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at    TIMESTAMPTZ,
  UNIQUE (company_id, user_id)
);

ALTER TABLE employer_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view their team"
  ON employer_team_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM employer_team_members etm
      WHERE etm.company_id = employer_team_members.company_id
      AND etm.user_id = auth.uid()
    )
  );

-- =============================================================================
-- JOB CATEGORIES
-- =============================================================================

CREATE TABLE job_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url    TEXT,
  parent_id   UUID REFERENCES job_categories(id),
  job_count   INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE job_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read categories" ON job_categories FOR SELECT USING (true);

INSERT INTO job_categories (name, slug) VALUES
  ('Technology', 'technology'),
  ('Finance', 'finance'),
  ('Healthcare', 'healthcare'),
  ('Marketing', 'marketing'),
  ('Sales', 'sales'),
  ('Design', 'design'),
  ('Engineering', 'engineering'),
  ('Human Resources', 'human-resources'),
  ('Education', 'education'),
  ('Legal', 'legal'),
  ('Operations', 'operations'),
  ('Customer Service', 'customer-service'),
  ('Data & Analytics', 'data-analytics'),
  ('Product Management', 'product-management');

-- =============================================================================
-- JOB LISTINGS
-- =============================================================================

CREATE TABLE job_listings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  posted_by_id          UUID NOT NULL REFERENCES auth.users(id),
  category_id           UUID REFERENCES job_categories(id),
  title                 TEXT NOT NULL,
  slug                  TEXT NOT NULL UNIQUE,
  description           TEXT NOT NULL,
  requirements          TEXT NOT NULL,
  responsibilities      TEXT NOT NULL,
  job_type              job_type NOT NULL,
  experience_level      experience_level NOT NULL,
  work_mode             work_mode NOT NULL DEFAULT 'onsite',
  salary_min            NUMERIC(12,2),
  salary_max            NUMERIC(12,2),
  currency              CHAR(3) NOT NULL DEFAULT 'USD',
  location              TEXT NOT NULL,
  country               TEXT NOT NULL,
  city                  TEXT,
  skills                TEXT[] NOT NULL DEFAULT '{}',
  benefits              TEXT[] NOT NULL DEFAULT '{}',
  status                content_status NOT NULL DEFAULT 'pending',
  is_featured           BOOLEAN NOT NULL DEFAULT false,
  application_deadline  TIMESTAMPTZ,
  view_count            INT NOT NULL DEFAULT 0,
  application_count     INT NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at            TIMESTAMPTZ,
  -- FTS vector (auto-populated by trigger)
  search_vector         TSVECTOR,
  CONSTRAINT salary_range_check CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max)
);

ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active job listings"
  ON job_listings FOR SELECT
  USING (status = 'active');

CREATE POLICY "Employers can manage their job listings"
  ON job_listings FOR ALL
  USING (
    auth.uid() = posted_by_id
    OR EXISTS (
      SELECT 1 FROM employer_team_members etm
      WHERE etm.company_id = job_listings.company_id
      AND etm.user_id = auth.uid()
      AND etm.role IN ('owner', 'admin', 'recruiter')
    )
  );

CREATE INDEX idx_job_listings_company ON job_listings(company_id);
CREATE INDEX idx_job_listings_status ON job_listings(status);
CREATE INDEX idx_job_listings_job_type ON job_listings(job_type);
CREATE INDEX idx_job_listings_work_mode ON job_listings(work_mode);
CREATE INDEX idx_job_listings_experience ON job_listings(experience_level);
CREATE INDEX idx_job_listings_country ON job_listings(country);
CREATE INDEX idx_job_listings_featured ON job_listings(is_featured) WHERE is_featured = true;
CREATE INDEX idx_job_listings_expires ON job_listings(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_job_listings_search ON job_listings USING gin(search_vector);
CREATE INDEX idx_job_listings_skills ON job_listings USING gin(skills);

-- FTS trigger
CREATE OR REPLACE FUNCTION update_job_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    coalesce(NEW.title, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(NEW.requirements, '') || ' ' ||
    coalesce(array_to_string(NEW.skills, ' '), '') || ' ' ||
    coalesce(NEW.location, '') || ' ' ||
    coalesce(NEW.city, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_job_search_vector
  BEFORE INSERT OR UPDATE ON job_listings
  FOR EACH ROW EXECUTE FUNCTION update_job_search_vector();

-- =============================================================================
-- SEEKER PROFILES
-- =============================================================================

CREATE TABLE seeker_profiles (
  user_id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  headline              TEXT,
  bio                   TEXT,
  current_title         TEXT,
  current_company       TEXT,
  location              TEXT,
  country               TEXT,
  skills                TEXT[] NOT NULL DEFAULT '{}',
  experience_level      experience_level,
  preferred_work_mode   work_mode,
  preferred_salary_min  NUMERIC(12,2),
  preferred_salary_max  NUMERIC(12,2),
  preferred_currency    CHAR(3) NOT NULL DEFAULT 'USD',
  is_open_to_work       BOOLEAN NOT NULL DEFAULT false,
  is_profile_public     BOOLEAN NOT NULL DEFAULT true,
  linkedin_url          TEXT,
  github_url            TEXT,
  portfolio_url         TEXT,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE seeker_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers can manage their own profile"
  ON seeker_profiles FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read public seeker profiles"
  ON seeker_profiles FOR SELECT
  USING (is_profile_public = true);

CREATE INDEX idx_seeker_skills ON seeker_profiles USING gin(skills);
CREATE INDEX idx_seeker_open_to_work ON seeker_profiles(is_open_to_work) WHERE is_open_to_work = true;

-- =============================================================================
-- RESUMES
-- =============================================================================

CREATE TABLE resumes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  file_url     TEXT NOT NULL,
  file_size    INT NOT NULL,
  mime_type    TEXT NOT NULL CHECK (mime_type IN ('application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')),
  is_default   BOOLEAN NOT NULL DEFAULT false,
  parsed_data  JSONB,
  ai_score     SMALLINT CHECK (ai_score >= 0 AND ai_score <= 100),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers can manage their own resumes"
  ON resumes FOR ALL
  USING (auth.uid() = seeker_id);

CREATE POLICY "Employers can view resumes for their applications"
  ON resumes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications a
      JOIN job_listings jl ON a.job_id = jl.id
      WHERE a.resume_id = resumes.id
      AND EXISTS (
        SELECT 1 FROM employer_team_members etm
        WHERE etm.company_id = jl.company_id
        AND etm.user_id = auth.uid()
      )
    )
  );

CREATE INDEX idx_resumes_seeker ON resumes(seeker_id);
CREATE INDEX idx_resumes_default ON resumes(seeker_id, is_default) WHERE is_default = true;

-- =============================================================================
-- APPLICATIONS
-- =============================================================================

CREATE TABLE applications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id           UUID NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
  seeker_id        UUID NOT NULL REFERENCES auth.users(id),
  resume_id        UUID NOT NULL REFERENCES resumes(id),
  cover_letter     TEXT,
  status           application_status NOT NULL DEFAULT 'submitted',
  applied_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  withdrawn_at     TIMESTAMPTZ,
  withdrawal_reason TEXT,
  UNIQUE (job_id, seeker_id)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers can manage their own applications"
  ON applications FOR ALL
  USING (auth.uid() = seeker_id);

CREATE POLICY "Employers can view applications for their jobs"
  ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM job_listings jl
      JOIN employer_team_members etm ON etm.company_id = jl.company_id
      WHERE jl.id = applications.job_id
      AND etm.user_id = auth.uid()
    )
  );

CREATE POLICY "Employers can update application status"
  ON applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM job_listings jl
      JOIN employer_team_members etm ON etm.company_id = jl.company_id
      WHERE jl.id = applications.job_id
      AND etm.user_id = auth.uid()
      AND etm.role IN ('owner', 'admin', 'recruiter', 'hiring_manager')
    )
  );

CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_seeker ON applications(seeker_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied_at ON applications(applied_at DESC);

-- Increment application count on insert
CREATE OR REPLACE FUNCTION increment_application_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE job_listings SET application_count = application_count + 1 WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_increment_application_count
  AFTER INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION increment_application_count();

-- =============================================================================
-- SAVED JOBS
-- =============================================================================

CREATE TABLE saved_jobs (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id    UUID NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
  saved_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes     TEXT,
  UNIQUE (seeker_id, job_id)
);

ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seekers can manage their saved jobs"
  ON saved_jobs FOR ALL
  USING (auth.uid() = seeker_id);

-- =============================================================================
-- UPDATED_AT TRIGGERS (shared function)
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_job_listings_updated_at BEFORE UPDATE ON job_listings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_seeker_profiles_updated_at BEFORE UPDATE ON seeker_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_resumes_updated_at BEFORE UPDATE ON resumes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION set_updated_at();
