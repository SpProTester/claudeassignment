-- =============================================================================
-- Migration: 20260101000001_subscriptions_and_payments
-- Purpose: Subscription plans, user subscriptions, payments, invoices
-- =============================================================================

-- =============================================================================
-- SUBSCRIPTION PLANS
-- =============================================================================

CREATE TABLE subscription_plans (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  tier                plan_tier NOT NULL,
  billing_interval    billing_interval NOT NULL,
  price               NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency            CHAR(3) NOT NULL DEFAULT 'USD',
  features            JSONB NOT NULL DEFAULT '{}',
  stripe_price_id     TEXT UNIQUE,
  razorpay_plan_id    TEXT UNIQUE,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active plans" ON subscription_plans FOR SELECT USING (is_active = true);

INSERT INTO subscription_plans (name, tier, billing_interval, price, features) VALUES
  ('Free', 'free', 'monthly', 0, '{"jobPostings":1,"featuredJobPostings":0,"resumeSearches":0,"teamMembers":1,"candidateDatabase":false,"atsAccess":false,"aiScreening":false,"analyticsLevel":"basic","supportLevel":"community"}'),
  ('Starter Monthly', 'starter', 'monthly', 49, '{"jobPostings":5,"featuredJobPostings":1,"resumeSearches":50,"teamMembers":3,"candidateDatabase":false,"atsAccess":true,"aiScreening":false,"analyticsLevel":"basic","supportLevel":"email"}'),
  ('Starter Annual', 'starter', 'annual', 39, '{"jobPostings":5,"featuredJobPostings":1,"resumeSearches":50,"teamMembers":3,"candidateDatabase":false,"atsAccess":true,"aiScreening":false,"analyticsLevel":"basic","supportLevel":"email"}'),
  ('Professional Monthly', 'professional', 'monthly', 149, '{"jobPostings":25,"featuredJobPostings":5,"resumeSearches":500,"teamMembers":10,"candidateDatabase":true,"atsAccess":true,"aiScreening":true,"analyticsLevel":"advanced","supportLevel":"priority"}'),
  ('Professional Annual', 'professional', 'annual', 119, '{"jobPostings":25,"featuredJobPostings":5,"resumeSearches":500,"teamMembers":10,"candidateDatabase":true,"atsAccess":true,"aiScreening":true,"analyticsLevel":"advanced","supportLevel":"priority"}'),
  ('Enterprise Monthly', 'enterprise', 'monthly', 499, '{"jobPostings":-1,"featuredJobPostings":-1,"resumeSearches":-1,"teamMembers":-1,"candidateDatabase":true,"atsAccess":true,"aiScreening":true,"analyticsLevel":"enterprise","supportLevel":"dedicated"}');

-- =============================================================================
-- SUBSCRIPTIONS
-- =============================================================================

CREATE TABLE subscriptions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id               UUID REFERENCES companies(id) ON DELETE CASCADE,
  seeker_id                UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id                  UUID NOT NULL REFERENCES subscription_plans(id),
  status                   subscription_status NOT NULL DEFAULT 'active',
  current_period_start     TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end       TIMESTAMPTZ NOT NULL,
  cancel_at_period_end     BOOLEAN NOT NULL DEFAULT false,
  trial_ends_at            TIMESTAMPTZ,
  stripe_subscription_id   TEXT UNIQUE,
  razorpay_subscription_id TEXT UNIQUE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT one_subscriber CHECK (
    (company_id IS NOT NULL AND seeker_id IS NULL)
    OR (company_id IS NULL AND seeker_id IS NOT NULL)
  )
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can read their subscription"
  ON subscriptions FOR SELECT
  USING (
    company_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM employer_team_members etm
      WHERE etm.company_id = subscriptions.company_id
      AND etm.user_id = auth.uid()
    )
  );

CREATE POLICY "Seekers can read their subscription"
  ON subscriptions FOR SELECT
  USING (seeker_id = auth.uid());

CREATE INDEX idx_subscriptions_company ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_seeker ON subscriptions(seeker_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE TRIGGER set_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- PAYMENTS
-- =============================================================================

CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id     UUID REFERENCES subscriptions(id),
  company_id          UUID REFERENCES companies(id),
  seeker_id           UUID REFERENCES auth.users(id),
  provider            payment_provider NOT NULL,
  provider_payment_id TEXT NOT NULL,
  amount              NUMERIC(10,2) NOT NULL,
  currency            CHAR(3) NOT NULL DEFAULT 'USD',
  status              payment_status NOT NULL DEFAULT 'pending',
  description         TEXT,
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own payments"
  ON payments FOR SELECT
  USING (
    seeker_id = auth.uid()
    OR (
      company_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM employer_team_members etm
        WHERE etm.company_id = payments.company_id
        AND etm.user_id = auth.uid()
        AND etm.role IN ('owner', 'admin')
      )
    )
  );

CREATE INDEX idx_payments_subscription ON payments(subscription_id);
CREATE INDEX idx_payments_company ON payments(company_id);
CREATE INDEX idx_payments_seeker ON payments(seeker_id);
CREATE TRIGGER set_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- INVOICES
-- =============================================================================

CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id      UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  invoice_number  TEXT NOT NULL UNIQUE,
  subtotal        NUMERIC(10,2) NOT NULL,
  tax             NUMERIC(10,2) NOT NULL DEFAULT 0,
  total           NUMERIC(10,2) NOT NULL,
  currency        CHAR(3) NOT NULL DEFAULT 'USD',
  pdf_url         TEXT,
  issued_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own invoices"
  ON invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM payments p
      WHERE p.id = invoices.payment_id
      AND (
        p.seeker_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM employer_team_members etm
          WHERE etm.company_id = p.company_id AND etm.user_id = auth.uid()
        )
      )
    )
  );
