-- =============================================================================
-- Migration: 20260101000002_notifications_and_ats
-- Purpose: Notifications, job alerts, ATS stages, interviews
-- =============================================================================

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================

CREATE TABLE notifications (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type      TEXT NOT NULL,
  channel   notification_channel NOT NULL DEFAULT 'in_app',
  title     TEXT NOT NULL,
  body      TEXT NOT NULL,
  data      JSONB,
  is_read   BOOLEAN NOT NULL DEFAULT false,
  read_at   TIMESTAMPTZ,
  sent_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notifications"
  ON notifications FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- =============================================================================
-- JOB ALERTS
-- =============================================================================

CREATE TABLE job_alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  keywords        TEXT[] NOT NULL DEFAULT '{}',
  location        TEXT,
  job_type        TEXT[],
  work_mode       TEXT[],
  salary_min      NUMERIC(12,2),
  frequency       TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('immediately', 'daily', 'weekly')),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  last_sent_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seekers can manage their job alerts"
  ON job_alerts FOR ALL
  USING (auth.uid() = seeker_id);

-- =============================================================================
-- ATS STAGES
-- =============================================================================

CREATE TABLE ats_stages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      UUID NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  position    SMALLINT NOT NULL,
  color       CHAR(7) NOT NULL DEFAULT '#6366f1',
  is_default  BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (job_id, position)
);

ALTER TABLE ats_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employers can manage ATS stages for their jobs"
  ON ats_stages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM job_listings jl
      JOIN employer_team_members etm ON etm.company_id = jl.company_id
      WHERE jl.id = ats_stages.job_id AND etm.user_id = auth.uid()
    )
  );

-- =============================================================================
-- ATS CANDIDATES (kanban position)
-- =============================================================================

CREATE TABLE ats_candidates (
  application_id UUID PRIMARY KEY REFERENCES applications(id) ON DELETE CASCADE,
  job_id         UUID NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
  stage_id       UUID NOT NULL REFERENCES ats_stages(id),
  position       INT NOT NULL DEFAULT 0,
  score          SMALLINT CHECK (score >= 0 AND score <= 100),
  tags           TEXT[] NOT NULL DEFAULT '{}',
  assigned_to    UUID REFERENCES auth.users(id),
  moved_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ats_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employers can manage ATS candidates for their jobs"
  ON ats_candidates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM job_listings jl
      JOIN employer_team_members etm ON etm.company_id = jl.company_id
      WHERE jl.id = ats_candidates.job_id AND etm.user_id = auth.uid()
    )
  );

CREATE INDEX idx_ats_candidates_stage ON ats_candidates(stage_id, position);
CREATE INDEX idx_ats_candidates_job ON ats_candidates(job_id);

-- =============================================================================
-- APPLICATION NOTES
-- =============================================================================

CREATE TABLE application_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  author_id       UUID NOT NULL REFERENCES auth.users(id),
  content         TEXT NOT NULL,
  is_internal     BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE application_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employers can manage notes for their applications"
  ON application_notes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM applications a
      JOIN job_listings jl ON jl.id = a.job_id
      JOIN employer_team_members etm ON etm.company_id = jl.company_id
      WHERE a.id = application_notes.application_id AND etm.user_id = auth.uid()
    )
  );

-- =============================================================================
-- INTERVIEWS
-- =============================================================================

CREATE TABLE interviews (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id    UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  scheduled_at      TIMESTAMPTZ NOT NULL,
  duration_minutes  SMALLINT NOT NULL DEFAULT 60,
  interview_type    interview_type NOT NULL,
  location          TEXT,
  meeting_url       TEXT,
  interviewer_ids   UUID[] NOT NULL DEFAULT '{}',
  status            interview_status NOT NULL DEFAULT 'scheduled',
  feedback_submitted BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers can manage interviews for their jobs"
  ON interviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM applications a
      JOIN job_listings jl ON jl.id = a.job_id
      JOIN employer_team_members etm ON etm.company_id = jl.company_id
      WHERE a.id = interviews.application_id AND etm.user_id = auth.uid()
    )
  );

CREATE POLICY "Seekers can view their own interviews"
  ON interviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications a
      WHERE a.id = interviews.application_id AND a.seeker_id = auth.uid()
    )
  );

CREATE INDEX idx_interviews_application ON interviews(application_id);
CREATE INDEX idx_interviews_scheduled ON interviews(scheduled_at);

-- =============================================================================
-- INTERVIEW FEEDBACK
-- =============================================================================

CREATE TABLE interview_feedback (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id          UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  interviewer_id        UUID NOT NULL REFERENCES auth.users(id),
  overall_rating        SMALLINT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  technical_rating      SMALLINT CHECK (technical_rating BETWEEN 1 AND 5),
  communication_rating  SMALLINT CHECK (communication_rating BETWEEN 1 AND 5),
  recommendation        TEXT NOT NULL CHECK (recommendation IN ('strong_yes', 'yes', 'no', 'strong_no')),
  notes                 TEXT NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (interview_id, interviewer_id)
);

ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Interviewers can manage their own feedback"
  ON interview_feedback FOR ALL
  USING (auth.uid() = interviewer_id);

CREATE POLICY "Employers can read all feedback for their interviews"
  ON interview_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM interviews i
      JOIN applications a ON a.id = i.application_id
      JOIN job_listings jl ON jl.id = a.job_id
      JOIN employer_team_members etm ON etm.company_id = jl.company_id
      WHERE i.id = interview_feedback.interview_id AND etm.user_id = auth.uid()
    )
  );

-- =============================================================================
-- APPLICATION TIMELINE
-- =============================================================================

CREATE TABLE application_timeline (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  status          application_status NOT NULL,
  note            TEXT,
  changed_by_id   UUID NOT NULL REFERENCES auth.users(id),
  changed_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE application_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seekers can view their own application timeline"
  ON application_timeline FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications a
      WHERE a.id = application_timeline.application_id AND a.seeker_id = auth.uid()
    )
  );

CREATE POLICY "Employers can view and create timeline entries"
  ON application_timeline FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM applications a
      JOIN job_listings jl ON jl.id = a.job_id
      JOIN employer_team_members etm ON etm.company_id = jl.company_id
      WHERE a.id = application_timeline.application_id AND etm.user_id = auth.uid()
    )
  );

-- Auto-insert timeline entry when application status changes
CREATE OR REPLACE FUNCTION track_application_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status <> OLD.status THEN
    INSERT INTO application_timeline (application_id, status, changed_by_id)
    VALUES (NEW.id, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_track_application_status
  AFTER UPDATE OF status ON applications
  FOR EACH ROW EXECUTE FUNCTION track_application_status();
