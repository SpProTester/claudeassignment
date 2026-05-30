-- ── 1. Create resume_templates table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resume_templates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(100) NOT NULL,
  slug         VARCHAR(50)  NOT NULL UNIQUE,
  description  TEXT,
  thumbnail_url TEXT,
  is_active    BOOLEAN      NOT NULL DEFAULT true,
  sort_order   INTEGER      NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ── 2. Seed the 5 templates ───────────────────────────────────────────────────
INSERT INTO resume_templates (name, slug, description, is_active, sort_order)
VALUES
  ('Modern',    'modern',    'Clean purple-accented layout — great for tech roles.',            true, 1),
  ('Corporate', 'corporate', 'Dark header with structured two-column layout.',                  true, 2),
  ('Minimal',   'minimal',   'Simple, clean, white background — lets content speak.',           true, 3),
  ('Creative',  'creative',  'Gradient purple header — perfect for design and creative roles.', true, 4),
  ('Executive', 'executive', 'Classic bordered layout — ideal for senior professionals.',       true, 5)
ON CONFLICT (slug) DO NOTHING;

-- ── 3. Add builder columns to resumes ────────────────────────────────────────
ALTER TABLE resumes
  ADD COLUMN IF NOT EXISTS template_id    UUID REFERENCES resume_templates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS resume_type    VARCHAR(20) NOT NULL DEFAULT 'uploaded',
  ADD COLUMN IF NOT EXISTS resume_content JSONB;

-- ── 4. Make file_name and storage_path nullable (builder resumes have no file)
ALTER TABLE resumes
  ALTER COLUMN file_name    DROP NOT NULL,
  ALTER COLUMN storage_path DROP NOT NULL;

-- ── 5. Add index on template_id ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS resumes_template_id_idx ON resumes (template_id);
