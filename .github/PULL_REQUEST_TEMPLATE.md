<!--
  ============================================================================
  JOB PORTAL — PULL REQUEST TEMPLATE
  ============================================================================
  INSTRUCTIONS:
  - Fill in ALL sections. Empty PRs will be returned for completion.
  - Delete sections that are genuinely not applicable (e.g., no UI changes).
  - PR title MUST follow Conventional Commits: type(scope): description
    Examples:
      feat(auth): add Google OAuth 2.0 login flow
      fix(ats): resolve kanban drag-and-drop state sync bug
      perf(jobs): add GIN index on job listings full-text search
  ============================================================================
-->

## Summary

<!-- 1-3 sentences. What does this PR do and why? What problem does it solve?
     Focus on the WHY, not just the what. The diff shows the what. -->

## Type of Change

<!-- Check all that apply -->

- [ ] `feat` — New feature (non-breaking)
- [ ] `fix` — Bug fix (non-breaking)
- [ ] `perf` — Performance improvement
- [ ] `refactor` — Code refactoring (no feature/fix)
- [ ] `docs` — Documentation update
- [ ] `test` — Adding or updating tests
- [ ] `build` — Build system / dependency change
- [ ] `ci` — CI/CD pipeline change
- [ ] `chore` — Maintenance (no production code change)
- [ ] `security` — Security fix or improvement
- [ ] `db` — Database migration or schema change
- [ ] **BREAKING CHANGE** — Requires major version bump

## Linked Issues

<!-- Link issues this PR resolves. GitHub auto-closes them on merge. -->
<!-- Use: Closes #123, Fixes #456, Resolves #789 -->

Closes #

## Module / Area Affected

<!-- Check all modules touched by this PR -->

- [ ] Auth (login, registration, OAuth, MFA, sessions)
- [ ] Public Website (homepage, job listings, SEO, search)
- [ ] Job Seeker (profile, resume, applications, dashboard)
- [ ] Employer (company profile, job posting, ATS, analytics)
- [ ] Admin Console (user management, moderation, config)
- [ ] AI / Recommendations (job matching, resume parsing)
- [ ] Payments / Subscriptions (Stripe, Razorpay, invoices)
- [ ] Notifications (email, in-app, push)
- [ ] Database (migrations, schema, RLS policies, indexes)
- [ ] API (route handlers, Edge Functions)
- [ ] UI / Design System (components, tokens, accessibility)
- [ ] Infrastructure (CI/CD, Vercel, Supabase config)
- [ ] Testing (unit, integration, E2E)

## Implementation Approach

<!-- How did you implement this? Call out non-obvious decisions.
     Explain trade-offs made. What alternatives did you consider? -->

## Testing

### Test Coverage

- [ ] Unit tests added/updated for changed business logic
- [ ] Integration tests added/updated for API routes
- [ ] E2E tests added/updated for critical user flows
- [ ] No tests needed (documentation, config, trivial change — explain below)

### Manual Testing Steps

<!--
  Provide exact steps to reproduce and test the change.
  Assume the reviewer has a clean environment.
-->

1.
2.
3.

### Test Scenarios Covered

| Scenario | Expected Result | Status |
|----------|----------------|--------|
| Happy path | ... | ✅ Tested |
| ... | ... | ... |

## Database Changes

<!-- Delete section if no DB changes -->

- [ ] Migration file created in `supabase/migrations/`
- [ ] RLS policies updated/added
- [ ] Indexes added/modified
- [ ] Seed data updated
- [ ] No backwards-incompatible schema changes

**Migration file**: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`

**Migration is safe to run on production?**
- [ ] Yes — no data loss, no locks on large tables
- [ ] Needs maintenance window — explain:

## UI / UX Changes

<!-- Delete section if no UI changes -->

### Screenshots / Screen Recordings

<!-- Before / After screenshots for UI changes. Drag and drop images here. -->

**Before:**
<!-- screenshot -->

**After:**
<!-- screenshot -->

### Accessibility Checklist

- [ ] Keyboard navigable (Tab, Enter, Escape, arrow keys)
- [ ] Screen reader tested (NVDA/VoiceOver)
- [ ] Color contrast passes WCAG 2.2 AA (4.5:1 minimum)
- [ ] ARIA labels added where needed
- [ ] Focus management correct (modals trap focus, restore on close)
- [ ] No accessibility regressions

### Responsive Design

- [ ] Tested on mobile (375px)
- [ ] Tested on tablet (768px)
- [ ] Tested on desktop (1280px+)

## Performance Impact

<!-- Delete if no performance implications -->

- [ ] Bundle size impact reviewed (`pnpm build:analyze`)
- [ ] Database queries analyzed with `EXPLAIN ANALYZE`
- [ ] No N+1 query patterns introduced
- [ ] ISR/SSG/SSR rendering strategy correct for new pages
- [ ] Caching strategy reviewed (ISR revalidation, Vercel KV, SWR)

## Security Checklist

- [ ] No secrets, API keys, or PII committed
- [ ] User input validated with Zod (client AND server)
- [ ] RLS policies enforced for new database access patterns
- [ ] No new IDOR (Insecure Direct Object Reference) vulnerabilities
- [ ] Auth checks on all protected API routes/Server Actions
- [ ] External URLs not rendered server-side without validation
- [ ] File uploads use UUID storage paths (no original filenames)

## Breaking Changes

<!-- Delete if no breaking changes -->

**BREAKING CHANGE**: <!-- describe what broke and migration path -->

**Migration guide for consumers**:

```
# Before
...

# After
...
```

## Deployment Notes

<!-- Anything ops needs to know before/during/after deployment -->

- [ ] No special deployment steps required
- [ ] Requires environment variable changes: <!-- list vars -->
- [ ] Requires database migration to run first
- [ ] Requires feature flag to be enabled: <!-- flag name -->
- [ ] Requires cache invalidation: <!-- describe -->

## Reviewer Notes

<!-- What should reviewers focus on? What should they NOT focus on?
     Any known issues or TODOs left intentionally? -->

## Checklist

<!-- Complete ALL items before requesting review -->

- [ ] PR title follows Conventional Commits format
- [ ] Self-reviewed the diff — no debug code, console.logs, or TODOs left accidentally
- [ ] All CI checks passing (lint, type-check, tests, build)
- [ ] No `eslint-disable` comments added without justification
- [ ] `pnpm type-check` passes locally
- [ ] Documentation updated if behavior changed
- [ ] `CHANGELOG.md` does NOT need manual update (automated by semantic-release)
- [ ] Added myself as assignee
- [ ] Requested review from relevant team members / CODEOWNERS
