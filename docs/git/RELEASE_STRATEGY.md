# Release Strategy — Job Portal Enterprise

> Automated semantic versioning via `semantic-release`.  
> Zero manual version bumps. Zero manual CHANGELOG edits.

---

## Overview

Releases are **fully automated**. When code is merged to `main`:

1. `semantic-release` analyzes ALL commits since the last release tag
2. Determines the version bump (MAJOR / MINOR / PATCH / none)
3. Generates CHANGELOG.md entry
4. Creates GitHub Release with formatted notes
5. Tags the commit (e.g., `v1.2.3`)
6. Updates `package.json` version
7. Commits CHANGELOG + package.json back to `main`

The team's job is to **write good commit messages** — the tooling handles everything else.

---

## Semantic Versioning (SemVer)

Format: `MAJOR.MINOR.PATCH` (e.g., `1.2.3`)

```
v1.2.3
 │ │ └── PATCH: backward-compatible bug fixes
 │ └──── MINOR: new backward-compatible features
 └────── MAJOR: breaking changes
```

### Version Bump Rules

| Commit type(s) in release | Bump | Example |
|--------------------------|------|---------|
| Contains `BREAKING CHANGE:` footer (any type) | MAJOR | `v1.0.0 → v2.0.0` |
| Contains at least one `feat` | MINOR | `v1.0.0 → v1.1.0` |
| Contains `fix`, `perf`, `security`, `a11y`, `revert` only | PATCH | `v1.0.0 → v1.0.1` |
| Only `docs`, `chore`, `ci`, `test`, `style`, `build` | No release | — |

### Examples

```
# Merge to main with these commits since last release:
feat(auth): add LinkedIn OAuth login         → MINOR bump
fix(resume): fix MIME type validation        → PATCH bump
chore(deps): update dependencies             → No bump

# Result: If last tag was v1.3.2, new release is v1.4.0
# (MINOR wins over PATCH in the same release)
```

---

## Release Channels

| Branch | Channel | Tag Format | Example |
|--------|---------|-----------|---------|
| `main` | Latest (stable) | `vX.Y.Z` | `v2.1.0` |
| `next` | Next (pre-release) | `vX.Y.Z-next.N` | `v2.2.0-next.1` |
| `beta` | Beta | `vX.Y.Z-beta.N` | `v2.2.0-beta.3` |
| `alpha` | Alpha | `vX.Y.Z-alpha.N` | `v2.2.0-alpha.5` |

---

## Release Workflow (Step by Step)

### Standard Release

```
develop ──(sprint end)──► release/x.y.z ──(QA pass)──► main ──► auto-release
```

```bash
# 1. Sprint is complete, all features merged to develop

# 2. Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/1.4.0

# 3. Run final QA on Vercel preview deployment
#    Fix any last-minute bugs directly on the release branch
git commit -m "fix(ats): resolve kanban state sync on rapid stage changes"

# 4. Update release candidate documentation if needed
git commit -m "docs: update CHANGELOG for v1.4.0 known limitations"

# 5. Open PR: release/1.4.0 → main
#    PR title: "release: v1.4.0 — ATS Kanban + LinkedIn OAuth"
#    Get 2 approvals (required for main merges)

# 6. Merge to main (merge commit, not squash)
# 7. semantic-release runs automatically in CI
# 8. v1.4.0 tag appears, GitHub Release created, CHANGELOG updated

# 9. Back-merge main to develop (important!)
git checkout develop
git pull origin develop
git merge main
git push origin develop

# 10. Delete release branch
git push origin --delete release/1.4.0
```

### Emergency Hotfix Release

```
main ──(hotfix/*)──► main ──► auto-patch-release ──► develop
```

```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/JP-789-critical-payment-bug

# 2. Implement minimal fix
git commit -m "fix(payments): verify Stripe webhook signature before processing

Added stripe.webhooks.constructEvent() signature verification.
Webhooks without valid signatures now return 400 instead of
being silently processed.

Fixes #789"

# 3. Open PR: hotfix/JP-789 → main
#    ALSO open PR: hotfix/JP-789 → develop (simultaneously)

# 4. Get emergency approval (1 senior engineer minimum)
# 5. Merge to main → auto-release v1.3.1 (patch)
# 6. Merge to develop → keep develop in sync
# 7. Delete hotfix branch
```

---

## CHANGELOG Format

The CHANGELOG.md is **auto-generated** by `@semantic-release/changelog`. Do not edit it manually.

```markdown
# Changelog

## [1.4.0] - 2026-06-15

### ✨ Features
- **auth:** add LinkedIn OAuth 2.0 login with PKCE flow (#145)
- **ats:** implement kanban drag-and-drop for applicant pipeline (#167)
- **ai:** add AI-powered job recommendations to seeker dashboard (#189)

### 🐛 Bug Fixes
- **resume:** reject files with mismatched MIME type (#201)
- **payments:** prevent duplicate Stripe webhook processing (#234)

### ⚡ Performance Improvements
- **search:** add GIN index on job_listings for 10x faster full-text search (#178)

### 🔒 Security
- **middleware:** add rate limiting for password reset endpoint (#256)
```

---

## Version Tags

```bash
# List all release tags
git tag -l "v*" --sort=-version:refname

# Inspect a specific release
git show v1.4.0

# Check what's in a release
git log v1.3.0..v1.4.0 --oneline

# Checkout a specific release (read-only)
git checkout v1.3.0 --detach
```

---

## Pre-release Versions

For major releases that need extended testing:

```bash
# 1. Create a next branch from develop
git checkout -b next

# 2. Merge candidate features to next
# 3. Each merge to next creates a pre-release tag:
#    v2.0.0-next.1, v2.0.0-next.2, ...

# 4. When stable, merge next → main for the final release
```

---

## Manual Release (Emergency Override)

If the automated release fails and a manual release is needed:

```bash
# Ensure you're on main with latest changes
git checkout main
git pull origin main

# Dry run to see what would be released
npx semantic-release --dry-run

# Run release manually (requires GITHUB_TOKEN env var)
GITHUB_TOKEN=your-token pnpm release
```

---

## Required Secrets (GitHub)

Configure these in GitHub Settings → Secrets and variables → Actions:

| Secret | Purpose |
|--------|---------|
| `GITHUB_TOKEN` | Auto-provided by GitHub — creates releases, tags |
| `TURBO_TOKEN` | Turborepo remote cache authentication |
| `TURBO_TEAM` | Turborepo team identifier |
| `CODECOV_TOKEN` | Coverage reporting |
| `NEXT_PUBLIC_SUPABASE_URL` | Build-time env (staging) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Build-time env (staging) |
| `GITLEAKS_LICENSE` | Secret scanning (optional) |

---

## What Changes in package.json

Semantic-release updates the `version` field in the root `package.json`:

```json
{
  "name": "job-portal",
  "version": "1.4.0"  // ← Auto-updated by semantic-release
}
```

This is committed back to `main` automatically with the message:
```
release: v1.4.0 [skip ci]
```

The `[skip ci]` prevents an infinite loop of CI runs.
