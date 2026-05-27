# Commit Convention — Job Portal Enterprise

> Follows the **Conventional Commits 1.0.0** specification.  
> Spec: https://www.conventionalcommits.org  
> Enforced by: `commitlint` (pre-commit hook) + GitHub Actions PR title check

---

## Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Rules

| Part | Rule |
|------|------|
| **type** | Required. Lowercase. One of the allowed types. |
| **scope** | Optional but encouraged. Lowercase. One of the allowed scopes. |
| **subject** | Required. Lowercase start. No period at end. Max 100 chars. Min 10 chars. |
| **body** | Optional. Separated from subject by blank line. Explain WHY, not WHAT. |
| **footer** | Optional. Separated from body by blank line. Used for `BREAKING CHANGE:` and issue refs. |

---

## Type Reference

| Type | When to Use | Version Bump | Appears in CHANGELOG |
|------|------------|-------------|----------------------|
| `feat` | New feature added | MINOR | Yes |
| `fix` | Bug fix | PATCH | Yes |
| `perf` | Performance improvement | PATCH | Yes |
| `security` | Security fix or improvement | PATCH | Yes |
| `a11y` | Accessibility improvement | PATCH | Yes |
| `revert` | Reverts a previous commit | PATCH | Yes |
| `refactor` | Code restructuring (no behavior change) | None | Hidden |
| `docs` | Documentation only | None | Hidden |
| `style` | Formatting, whitespace (no logic) | None | Hidden |
| `test` | Adding/updating tests | None | Hidden |
| `build` | Build system, dependencies | None | Hidden |
| `ci` | CI/CD configuration | None | Hidden |
| `chore` | Maintenance, tooling | None | Hidden |
| `db` | Database migration, schema | None* | Hidden |
| `i18n` | Internationalization | None | Hidden |
| `release` | Automated release commit | — | — |

> \* A database migration that introduces a breaking schema change should use `feat` with `BREAKING CHANGE:` footer.

---

## Scope Reference

Scopes correspond to the modules and layers of the Job Portal architecture.

### Domain Scopes

```
auth          Authentication (login, register, sessions)
oauth         OAuth flows (Google, LinkedIn)
mfa           Multi-factor authentication
jobs          Job listings, job detail pages
seeker        Job seeker profile and features
employer      Employer profile and features
admin         Admin console
ats           Applicant Tracking System
ai            AI recommendations and resume parsing
payments      Payment processing (Stripe, Razorpay)
subscriptions Plan management and quota enforcement
notifications Email, in-app, push notifications
search        Job search and filtering
resume        Resume upload, parsing, management
analytics     Employer and platform analytics
```

### Tech Layer Scopes

```
api           Next.js API route handlers
db            Database schema, queries
migrations    Supabase migration files
middleware    Next.js Edge middleware
edge-functions  Supabase Edge Functions (Deno)
storage       Supabase Storage operations
realtime      Supabase Realtime subscriptions
```

### Frontend Scopes

```
ui            Shared UI components (packages/ui)
components    Feature-specific components
hooks         Custom React hooks
store         Zustand state stores
layout        Page layouts, navigation
pages         Next.js page components
forms         Form components and validation
```

### Infrastructure Scopes

```
ci            CI configuration (GitHub Actions)
cd            Deployment configuration
config        Shared configuration
deps          Dependency updates
docker        Docker/container configuration
vercel        Vercel deployment config
supabase      Supabase project config
```

### Cross-cutting Scopes

```
security      Security improvements
performance   Performance optimizations
a11y          Accessibility improvements
seo           SEO improvements
types         TypeScript type definitions
utils         Shared utility functions
testing       Test infrastructure
```

---

## Examples

### Feature Commits

```bash
# Simple feature
feat(auth): add Google OAuth 2.0 login

# Feature with scope detail
feat(ats): implement kanban drag-and-drop for applicant pipeline

# Feature with body explaining the WHY
feat(ai): add AI-powered job recommendations to seeker dashboard

Implements collaborative filtering + content-based scoring using
seeker profile skills vs job listing requirements.

Falls back to Supabase full-text search when the AI model has
insufficient data (< 5 applications) for a given seeker.

Closes #145

# Feature with breaking change
feat(api): replace /v1/jobs with /v2/jobs endpoint

BREAKING CHANGE: The /v1/jobs endpoint has been removed.
Consumers must migrate to /v2/jobs which uses cursor-based
pagination instead of offset-based pagination.

Migration guide: docs/api/v1-to-v2-migration.md
```

### Fix Commits

```bash
# Simple fix
fix(resume): reject files with mismatched MIME type and extension

# Fix with issue reference
fix(payments): prevent duplicate Stripe webhook processing

Added idempotency check using Stripe event ID stored in payments
table. Duplicate webhooks now return 200 without reprocessing.

Fixes #234

# Fix with body
fix(search): resolve incorrect pagination count on filtered results

The total count was being calculated before filters were applied,
causing pagination controls to show incorrect page counts when
using salary or experience level filters.
```

### Database / Migration Commits

```bash
db(migrations): add GIN index on job_listings for full-text search

db(migrations): add applications(job_id, seeker_id) unique constraint

db(migrations): create interview_schedules table

# Breaking schema change uses feat with BREAKING CHANGE
feat(db): normalize work_experience into separate table

BREAKING CHANGE: work_experience data previously stored as JSONB
in seeker_profiles has been migrated to the work_experiences table.
All seeker profile reads must now join work_experiences.
```

### Infrastructure Commits

```bash
ci: add Playwright E2E tests to CI pipeline

ci: configure Turborepo remote cache with Vercel

chore(deps): upgrade Next.js from 14.1 to 14.2

chore(deps): update Supabase JS client to v2.43.0

build: add bundle analyzer to web app build script

security: enforce strict Content-Security-Policy headers

security(middleware): add rate limiting for password reset endpoint
```

### Documentation Commits

```bash
docs(api): add OpenAPI spec for job seeker endpoints

docs: update branching strategy with AI-assisted development guide

docs(db): document RLS policy rationale for applications table
```

---

## Breaking Changes

Breaking changes are indicated by:
1. Adding `BREAKING CHANGE:` as a footer (can be on any commit type)
2. The `!` shorthand after type/scope: `feat(api)!: remove deprecated endpoint`

```bash
# Footer style (preferred — allows detailed description)
feat(auth): switch session storage from localStorage to httpOnly cookies

BREAKING CHANGE: Sessions are no longer accessible via JavaScript.
Third-party integrations that read the session token from localStorage
must be updated to use the /auth/session API endpoint instead.

# Bang style (concise — use for obvious breaking changes)
feat(api)!: require authentication for job listing views
fix(db)!: rename employer_id to company_id across all tables
```

---

## What NOT to Do

```bash
# Too vague
git commit -m "fix: bug fix"                    ❌ No scope, no description
git commit -m "feat: stuff"                     ❌ Not descriptive
git commit -m "update"                          ❌ Not conventional commits format
git commit -m "wip"                             ❌ WIP commits shouldn't be pushed
git commit -m "asdfgh"                          ❌ Obviously wrong

# Wrong case
git commit -m "Fix: resolve auth bug"           ❌ Type must be lowercase
git commit -m "feat(Auth): add login"           ❌ Scope must be lowercase
git commit -m "feat(auth): Add login."          ❌ Subject must start lowercase, no period

# Too long subject
git commit -m "feat(auth): add Google OAuth 2.0 login with PKCE flow and automatic profile creation from Google account data and email verification bypass"
# ❌ Subject over 100 chars — move details to body

# Referencing implementation tool
git commit -m "feat(auth): claude code added OAuth login"  ❌ Don't reference AI tools
git commit -m "feat(auth): AI-generated Google login"      ❌ Not meaningful history
```

---

## Revert Commits

```bash
# Revert a specific commit
git revert abc1234

# Commitlint will validate the auto-generated revert message:
# revert: feat(auth): add Google OAuth 2.0 login
#
# This reverts commit abc1234.
```

---

## Using Commitizen (Interactive Prompt)

Instead of writing commit messages manually, use the interactive prompt:

```bash
pnpm commit
# OR
git cz
```

This launches an interactive prompt that guides you through:
1. Select type
2. Select scope
3. Write subject
4. Write body (optional)
5. Breaking change? (yes/no)
6. Issue references

---

## Commit Signing (Recommended)

For `main` branch, signed commits are required (configured in branch protection):

```bash
# Configure GPG signing globally
git config --global commit.gpgsign true
git config --global user.signingkey YOUR_GPG_KEY_ID

# Or use SSH signing (simpler)
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
```
