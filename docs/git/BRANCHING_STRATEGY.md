# Branching Strategy — Job Portal Enterprise

> Quick reference for branch naming conventions, lifetime, and rules.

---

## Branch Naming Format

```
<type>/<optional-ticket-id>-<kebab-case-description>
```

### Type Reference

| Type | When to Use | Example |
|------|------------|---------|
| `feature` | New functionality from the SRS or backlog | `feature/JP-123-job-seeker-profile` |
| `fix` | Bug fix for non-critical issues | `fix/JP-234-resume-mime-validation` |
| `hotfix` | Critical production bug requiring immediate deploy | `hotfix/JP-301-auth-token-bypass` |
| `release` | Release preparation branch | `release/1.2.0` |
| `chore` | Dependency updates, tooling, configuration | `chore/upgrade-supabase-js-v2` |
| `docs` | Documentation only changes | `docs/api-seeker-endpoints` |
| `refactor` | Code restructuring without behavior change | `refactor/auth-middleware-cleanup` |
| `ci` | CI/CD pipeline changes | `ci/add-playwright-e2e-workflow` |
| `test` | Adding or fixing tests only | `test/employer-ats-unit-tests` |
| `perf` | Performance optimization | `perf/job-listing-query-index` |
| `security` | Security-specific changes | `security/JP-412-xss-csp-headers` |
| `db` | Database migration or schema change | `db/JP-178-add-applications-index` |
| `a11y` | Accessibility improvements | `a11y/keyboard-nav-job-filters` |
| `revert` | Reverting a previous change | `revert/JP-123-bad-feature` |

---

## Branch Naming Rules

```
✅ feature/JP-123-google-oauth-login          Correct
✅ fix/JP-456-duplicate-application-check     Correct
✅ release/2.0.0                              Correct
✅ chore/update-dependencies                  Correct (no ticket for chores)
✅ hotfix/JP-789-payment-webhook-bypass       Correct

❌ Feature/JP-123-Google-OAuth               Uppercase not allowed
❌ feature/google oauth login                 Spaces not allowed
❌ feature/google_oauth_login                 Underscores not allowed
❌ feature/JP-123                             Too short — description required
❌ jp-123-feature                             Missing type prefix
❌ feature/JP123-google-oauth                 Missing hyphen after JP
❌ my-feature                                 Missing type prefix
❌ develop-new-feature                        Should be feature/...
```

---

## Ticket ID Convention

Ticket IDs follow the format `JP-<number>` (Job Portal).

```bash
# With ticket (preferred for feature/fix/hotfix/security)
feature/JP-123-job-seeker-dashboard-redesign
fix/JP-456-employer-quota-enforcement
hotfix/JP-789-stripe-webhook-verification

# Without ticket (acceptable for chores/docs/ci/refactor)
chore/update-next-14-dependencies
docs/supabase-rls-policy-reference
ci/add-bundle-size-reporting
```

---

## Branch Lifetime

| Type | Expected Lifetime | Action When Done |
|------|------------------|------------------|
| `feature/*` | Days to 1 week | Delete after PR merged to `develop` |
| `fix/*` | Hours to 2 days | Delete after PR merged to `develop` |
| `hotfix/*` | Hours | Delete after merged to `main` AND `develop` |
| `release/*` | 1–3 days | Delete after merged to `main` and `develop` |
| `chore/*` | Hours to 1 day | Delete after PR merged |
| `docs/*` | Hours | Delete after PR merged |
| `refactor/*` | Days | Delete after PR merged |
| `db/*` | Hours to 2 days | Delete after PR merged |

> **Keep feature branches short-lived.** Branches that live longer than a week accumulate merge conflicts and become harder to review. If a feature is large, break it into smaller vertical slices.

---

## Scope Reference for Branches and Commits

Match your branch description to one of these domain areas:

### Auth & Identity
- `auth` — login, logout, session
- `oauth` — Google/LinkedIn OAuth
- `mfa` — multi-factor authentication
- `session` — JWT, refresh tokens

### Job Seeker
- `seeker` — seeker profile
- `resume` — resume upload/parsing
- `applications` — job applications
- `saved-jobs` — bookmarks

### Employer
- `employer` — employer profile
- `job-posting` — create/edit jobs
- `ats` — applicant tracking
- `analytics` — employer dashboards

### Platform
- `search` — job search, filters
- `notifications` — email/in-app/push
- `payments` — Stripe/Razorpay
- `subscriptions` — plan management

### Tech
- `api` — API routes
- `db` — database, migrations
- `middleware` — Next.js middleware
- `ci` — CI/CD pipelines
- `security` — security patches
- `perf` — performance

---

## Multi-Developer Feature Branches

When multiple developers work on the same feature:

```bash
# Base feature branch (team-shared)
feature/JP-123-employer-ats

# Individual developer sub-branches
feature/JP-123-employer-ats/kanban-board      # Developer A
feature/JP-123-employer-ats/applicant-profile  # Developer B
feature/JP-123-employer-ats/email-templates    # Developer C

# Merge sub-branches → base feature branch first (PR or direct push with approval)
# Then merge base feature branch → develop via PR
```

---

## Quick Commands

```bash
# List all local branches
git branch --list

# List remote branches
git branch -r

# Delete merged local branches
git branch --merged develop | grep -v "develop\|main" | xargs git branch -d

# Delete a remote branch after PR merge
git push origin --delete feature/JP-123-google-oauth-login

# Check what branch you're on
git branch --show-current

# View branch creation date and author
git log --format="%ai %an" feature/JP-123-google-oauth-login | tail -1
```
