# Contributing to Job Portal

Thank you for contributing to the Job Portal & Recruitment Platform. This document covers everything you need to set up your development environment and contribute effectively.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | >= 20.0.0 | [nodejs.org](https://nodejs.org) |
| pnpm | >= 9.0.0 | `npm install -g pnpm` |
| Git | >= 2.40.0 | [git-scm.com](https://git-scm.com) |
| Docker | >= 24.0.0 | Required for local Supabase |

---

## Initial Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/job-portal.git
cd job-portal

# 2. Install dependencies (installs Husky hooks automatically via prepare script)
pnpm install

# 3. Set up environment variables
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local
# Fill in your local Supabase credentials

# 4. Start local Supabase
pnpm supabase start

# 5. Run database migrations
pnpm supabase db push

# 6. Start the development server
pnpm dev
```

---

## Development Workflow

1. **Read the workflow docs** before your first contribution:
   - [Git Workflow](docs/git/GIT_WORKFLOW.md)
   - [Branching Strategy](docs/git/BRANCHING_STRATEGY.md)
   - [Commit Convention](docs/git/COMMIT_CONVENTION.md)
   - [Release Strategy](docs/git/RELEASE_STRATEGY.md)

2. **Pick a task** from the GitHub Issues board (look for `needs-contributor` label)

3. **Branch from `develop`**:
   ```bash
   git checkout develop && git pull origin develop
   git checkout -b feature/JP-XXX-your-feature
   ```

4. **Develop**, committing with Conventional Commits format

5. **Before pushing**, ensure:
   ```bash
   pnpm lint          # No lint errors
   pnpm type-check    # No TypeScript errors
   pnpm test          # All tests pass
   ```

6. **Open a PR** against `develop` using the PR template

---

## Commit Messages

Follow the [Commit Convention](docs/git/COMMIT_CONVENTION.md).

```bash
# Interactive prompt (recommended)
pnpm commit

# Manual (enforced by commitlint)
git commit -m "feat(auth): add Google OAuth 2.0 login"
```

---

## Code Standards

- **TypeScript strict mode** — no `any`, no `@ts-ignore` without justification
- **No `eslint-disable`** without a comment explaining why
- **No commented-out code** — delete it, git history preserves it
- **No `console.log`** in production code — use the logger utility
- **No inline styles** — use Tailwind classes only
- **Zod for all validation** — client AND server, shared schemas
- **Server Components by default** — use `'use client'` only when needed

---

## Testing Requirements

| Layer | Minimum Coverage | Tool |
|-------|-----------------|------|
| Business logic (lib/) | 80% | Vitest |
| API routes (app/api/) | 60% | Vitest |
| UI components | Snapshot + interaction | Testing Library |
| Critical user flows | E2E tests | Playwright |

```bash
pnpm test                  # Unit tests (watch mode in dev)
pnpm test:coverage         # Coverage report
pnpm test:e2e              # Playwright E2E (requires running app)
```

---

## Database Changes

1. **Never write raw SQL in production** — always use Supabase migrations
2. Create migration: `pnpm supabase migration new <description>`
3. Write migration SQL in `supabase/migrations/<timestamp>_<description>.sql`
4. Test locally: `pnpm supabase db push`
5. Always include **RLS policies** for new tables
6. Document the migration purpose in the PR description

---

## Security Guidelines

- **Never commit secrets** — use `.env.local` (gitignored)
- **Always validate input** server-side with Zod, even if validated client-side
- **Check RLS policies** for any new database access patterns
- **Report security vulnerabilities** via [private disclosure](../../security/advisories/new), not public issues

---

## Getting Help

- **Questions**: Open a [GitHub Discussion](../../discussions)
- **Bugs**: File a [Bug Report](../../issues/new?template=bug_report.yml)
- **Features**: File a [Feature Request](../../issues/new?template=feature_request.yml)
- **Security**: Use [private vulnerability reporting](../../security/advisories/new)
