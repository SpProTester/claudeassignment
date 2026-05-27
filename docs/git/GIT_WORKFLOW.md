# Git Workflow — Job Portal Enterprise

> **Version**: 1.0.0 | **Stack**: Next.js · TypeScript · Supabase · Vercel  
> **Model**: Modified Gitflow with trunk-based deployment via `main`

---

## Table of Contents

1. [Overview](#overview)
2. [Branch Model](#branch-model)
3. [Development Lifecycle](#development-lifecycle)
4. [Hotfix Process](#hotfix-process)
5. [Release Process](#release-process)
6. [Environment Mapping](#environment-mapping)
7. [Protected Branch Rules](#protected-branch-rules)
8. [Merge Strategy](#merge-strategy)
9. [Conflict Resolution](#conflict-resolution)
10. [Claude Code / AI-Assisted Development](#claude-code--ai-assisted-development)

---

## Overview

The Job Portal uses a **Modified Gitflow** workflow optimized for:
- A small-to-medium engineering team (3–15 developers)
- Continuous integration with automated quality gates
- Rapid feature iteration without sacrificing `main` stability
- Automated semantic releases via conventional commits
- First-class support for AI-assisted (vibe coding) development sessions

```
main ─────────────────────────────────────────────────────── PRODUCTION
  ↑ (squash merge from release/*)        ↑ (squash merge hotfix/*)
  
release/x.y.z ──────────────────────────
  ↑ (merge from develop when ready)

develop ─────────────────────────────────────────────────── STAGING
  ↑ feature/*   ↑ fix/*   ↑ chore/*   ↑ docs/*   ↑ refactor/*
```

---

## Branch Model

### Permanent Branches

| Branch | Purpose | Deploys To | Direct Push |
|--------|---------|------------|-------------|
| `main` | Production-ready code, tagged releases | Production (Vercel) | Blocked |
| `develop` | Integration branch, latest stable development | Staging (Vercel Preview) | Blocked |

### Transient Branches

| Prefix | Purpose | Base | Merges Into |
|--------|---------|------|-------------|
| `feature/*` | New features | `develop` | `develop` |
| `fix/*` | Bug fixes (non-critical) | `develop` | `develop` |
| `hotfix/*` | Critical production fixes | `main` | `main` + `develop` |
| `release/*` | Release preparation | `develop` | `main` + `develop` |
| `chore/*` | Maintenance, dependency updates | `develop` | `develop` |
| `docs/*` | Documentation only | `develop` | `develop` |
| `refactor/*` | Code restructuring | `develop` | `develop` |
| `ci/*` | CI/CD changes | `develop` | `develop` |
| `test/*` | Test additions only | `develop` | `develop` |
| `perf/*` | Performance improvements | `develop` | `develop` |
| `security/*` | Security patches | `main` or `develop` | `main` + `develop` |
| `db/*` | Database migrations | `develop` | `develop` |

### Branch Naming Convention

```
<type>/<ticket-id>-<short-kebab-description>
```

**Examples**:
```bash
feature/JP-123-google-oauth-login
feature/JP-145-ats-kanban-drag-drop
fix/JP-234-resume-upload-mime-validation
fix/JP-267-pagination-offset-calculation
hotfix/JP-301-stripe-webhook-signature-bypass
release/1.2.0
chore/update-supabase-dependencies
chore/JP-189-upgrade-next-14-5
docs/api-endpoint-documentation
docs/job-seeker-onboarding-guide
refactor/JP-156-auth-middleware-cleanup
security/JP-412-rate-limit-bypass
db/JP-178-add-applications-index
ci/JP-200-add-coverage-reporting
```

**Rules**:
- Lowercase only
- Hyphens as word separators (no underscores, no spaces)
- Ticket ID optional but strongly recommended for `feature/` and `fix/` branches
- Max 80 characters total
- No consecutive hyphens

---

## Development Lifecycle

### Step 1: Sync and Branch

```bash
# Always start from an up-to-date develop
git checkout develop
git pull origin develop

# Create your feature branch
git checkout -b feature/JP-123-your-feature-description
```

### Step 2: Develop

```bash
# Make commits using Conventional Commits format
# (commitlint will enforce this on commit-msg hook)
git add -p                     # Stage changes interactively (preferred over git add .)
git commit                     # Opens interactive prompt if commitizen is configured
# OR
git commit -m "feat(auth): add Google OAuth 2.0 login with PKCE flow"
```

**During development**:
- Commit early and often — small commits are easier to review and revert
- Keep each commit focused on a single logical change
- Run `pnpm type-check` and `pnpm test` locally before each push
- The pre-push hook will block if type-check or tests fail

### Step 3: Keep Branch Updated

```bash
# Rebase onto develop regularly to avoid large merge conflicts
git fetch origin
git rebase origin/develop

# Resolve any conflicts, then:
git rebase --continue
```

> **Use `rebase` (not `merge`) to update feature branches.** This keeps history linear and makes PRs easier to review. Never rebase branches that others are working on.

### Step 4: Push and Open PR

```bash
git push origin feature/JP-123-your-feature-description

# Open PR on GitHub:
# Base: develop ← Head: feature/JP-123-your-feature-description
```

**PR Requirements (enforced by branch protection)**:
- CI must pass (lint + type-check + tests + build)
- At least 1 approved review (2 for security-sensitive paths)
- CODEOWNERS must approve for their paths
- No unresolved conversations
- PR title must follow Conventional Commits

### Step 5: Merge

Once approved and all checks pass:
1. **Squash and merge** into `develop` (default for feature branches)
2. Delete the feature branch after merge
3. The squash commit message becomes the canonical commit in `develop`'s history

---

## Hotfix Process

Hotfixes bypass `develop` and go directly to `main` for immediate production deployment.

```bash
# 1. Branch from main (not develop)
git checkout main
git pull origin main
git checkout -b hotfix/JP-301-critical-payment-bug

# 2. Make the minimal fix
git commit -m "fix(payments): resolve Stripe webhook signature verification bypass"

# 3. Open TWO PRs simultaneously:
#    PR 1: hotfix/JP-301 → main     (for immediate production fix)
#    PR 2: hotfix/JP-301 → develop  (to keep develop in sync)

# 4. After merging to main, semantic-release creates the patch version tag
# 5. After merging to develop, the fix is included in future releases
```

**Hotfix rules**:
- Must be the smallest possible change — no refactoring, no new features
- Requires immediate review from engineering lead
- Must merge to BOTH `main` and `develop`
- Document the incident in the PR description

---

## Release Process

Releases are **fully automated** via semantic-release when commits are merged to `main`. Manual release branches are only needed for coordinated releases with specific feature gates.

### Automated Release (Default)

```
feature/* → develop → (QA on staging) → release/* → main → auto-tag + CHANGELOG
```

1. All features for the release are merged to `develop`
2. QA validates on staging environment (Vercel preview of `develop`)
3. Create a `release/x.y.z` branch from `develop`
4. Final fixes and version bump on the release branch
5. Merge `release/x.y.z` → `main` via PR
6. Semantic-release automatically:
   - Determines version from commit history
   - Generates CHANGELOG.md entry
   - Creates GitHub Release with notes
   - Tags the commit (e.g., `v1.2.0`)
   - Updates `package.json` version

### Version Determination

Semantic-release reads ALL commits since the last release tag and determines the version bump:

| Commit Type | Version Bump | Example |
|-------------|-------------|---------|
| `feat` | MINOR (1.x.0) | `feat(jobs): add salary filter` |
| `fix`, `perf`, `security` | PATCH (1.0.x) | `fix(auth): resolve session expiry bug` |
| `BREAKING CHANGE` footer | MAJOR (x.0.0) | Any commit with `BREAKING CHANGE:` |
| `docs`, `chore`, `ci`, `test`, `style` | No release | — |

---

## Environment Mapping

| Branch | Environment | URL | Auto-Deploy |
|--------|------------|-----|-------------|
| `main` | Production | `jobportal.com` | Yes (on merge) |
| `develop` | Staging | `staging.jobportal.com` | Yes (on push) |
| `release/*` | Pre-production | `rc.jobportal.com` | Yes (on push) |
| `feature/*`, `fix/*` | Preview | `{branch}.vercel.app` | Yes (Vercel) |

---

## Protected Branch Rules

Configure these rules in GitHub Settings → Branches:

### `main` branch rules:
- Require pull request before merging
- Required approving reviews: **2**
- Dismiss stale PR approvals when new commits are pushed
- Require review from CODEOWNERS
- Require status checks to pass: `ci-success`, `validate-title`, `validate-branch`
- Require branches to be up to date before merging
- Require signed commits
- Include administrators
- Block force pushes
- Block deletions

### `develop` branch rules:
- Require pull request before merging
- Required approving reviews: **1**
- Require status checks: `ci-success`, `validate-title`, `validate-branch`
- Require branches to be up to date
- Block force pushes
- Block deletions

---

## Merge Strategy

| Branch type | Merge strategy | Rationale |
|-------------|----------------|-----------|
| `feature/*` → `develop` | **Squash merge** | Clean history, one commit per feature |
| `fix/*` → `develop` | **Squash merge** | Clean history |
| `release/*` → `main` | **Merge commit** | Preserve release history, creates merge commit |
| `hotfix/*` → `main` | **Squash merge** | Atomic, single commit in production history |
| `hotfix/*` → `develop` | **Merge commit** | Preserves full context of the hotfix |

> **Never use `git merge --ff` (fast-forward merge) on `main` or `develop`.** Merge commits on these permanent branches make history traversal much easier.

---

## Conflict Resolution

```bash
# Update your branch before resolving conflicts
git fetch origin
git rebase origin/develop

# If conflicts occur during rebase:
# 1. Resolve the conflicting files
# 2. git add <resolved-files>
# 3. git rebase --continue
# 4. Repeat for each conflicting commit

# If rebase gets complicated (many commits, many conflicts):
git rebase --abort
# Then use merge strategy instead:
git merge origin/develop
# Resolve conflicts, commit, and note in PR that merge was used
```

---

## Claude Code / AI-Assisted Development

When using Claude Code (this tool) for vibe coding sessions:

### Recommended Workflow

```bash
# 1. Start a Claude Code session on a feature branch (never on develop/main)
git checkout -b feature/JP-XXX-ai-session-description

# 2. Let Claude Code implement the feature
# 3. Review ALL changes before committing:
git diff                     # Review all changes
git diff --staged            # Review staged changes

# 4. Stage selectively (never blindly stage everything)
git add -p                   # Interactive staging — review each hunk

# 5. Commit with a meaningful message
git commit -m "feat(auth): implement Google OAuth 2.0 with PKCE flow

- Add Google provider to Supabase Auth configuration
- Implement OAuth callback handler at /auth/callback
- Add session persistence with httpOnly cookie
- Handle OAuth error states and redirect logic

Closes #123"

# 6. Push and open PR for human review
git push origin feature/JP-XXX-ai-session-description
```

### AI Session Boundaries

- **Always** review AI-generated code before committing
- **Never** blindly `git add .` after an AI session — use `git add -p`
- **Never** let AI push directly to `develop` or `main`
- Each logical feature/fix should be its own commit, even if the AI implemented them in one session
- If the AI session produced a large amount of code, split it into multiple focused commits

### Commit Message After AI Session

Even if Claude Code generated the implementation, the commit message should describe the WHAT and WHY:

```bash
# Good: Explains what was implemented and why
feat(resume): add AI-powered resume parser with GPT-4

Integrates OpenAI GPT-4 API via Supabase Edge Function to extract
structured data from uploaded resumes (PDF/DOC/DOCX).

Implements UC-003 from the SRS. Parsing runs asynchronously to
avoid blocking the upload response.

# Bad: References the AI tool
feat: claude code implemented resume parser feature
```
