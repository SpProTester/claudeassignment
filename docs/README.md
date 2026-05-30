# Job Portal — Documentation Hub

> Enterprise-grade Monster.com clone | React + Node.js + PostgreSQL + Sequelize

---

## Project Architecture Overview

```
Monster.com-replica/
├── client/                         # React 18 + Vite + Tailwind CSS frontend
│   ├── public/                     # Static assets
│   └── src/
│       ├── components/
│       │   ├── common/             # Button, Input, Navbar, Footer, Toast
│       │   ├── layout/             # Layout wrappers
│       │   ├── employer/           # Employer-specific UI
│       │   ├── seeker/             # Seeker-specific UI
│       │   └── billing/            # Pricing, PlanGate, UpgradeModal
│       ├── pages/
│       │   ├── Home.jsx            # Public landing page
│       │   ├── Jobs.jsx            # Job search + listings
│       │   ├── JobDetail.jsx       # Single job detail
│       │   ├── Login.jsx / Register.jsx
│       │   ├── employer/           # Dashboard, JobForm, ATS, Billing
│       │   └── seeker/             # Dashboard, Profile, Resume, Applications
│       ├── context/                # AuthContext (JWT + user state)
│       ├── hooks/                  # useAuth, useBilling, useSocket, useDebounce
│       ├── services/               # API service layers (axios wrappers)
│       ├── store/                  # Zustand stores (seekerStore, uiStore)
│       ├── routes/                 # React Router v6 route definitions
│       └── utils/                  # helpers.js (formatDate, formatSalary, etc.)
│
├── server/                         # Node.js + Express + Sequelize backend
│   └── src/
│       ├── config/                 # database.js, stripe.js, paths.js
│       ├── controllers/            # Route handlers (thin layer, calls services)
│       ├── models/                 # Sequelize ORM models + associations
│       ├── routes/                 # Express route definitions
│       ├── services/               # Business logic (job-alert.cron, notification)
│       ├── middleware/             # auth, validate, error, upload
│       ├── migrations/             # Sequelize CLI migrations (version-controlled)
│       ├── utils/                  # jwt, email, response helpers
│       └── app.js                  # Express app setup
│
├── database/
│   ├── migrations/                 # Canonical SQL migration scripts
│   ├── schemas/                    # Reference ERD and schema diagrams
│   └── seeders/                    # Seed data for dev/test environments
│
├── docs/                           # THIS FOLDER — module-wise documentation
│   ├── authentication/
│   ├── jobs/
│   ├── companies/
│   ├── admin/
│   ├── payments/
│   ├── notifications/
│   ├── search/
│   ├── chat/
│   ├── analytics/
│   └── git/                        # Branching strategy, commit conventions
│
├── prompts/                        # AI prompt library (phase-wise)
│   ├── phase-1-project-setup/
│   ├── phase-2-database/
│   ├── phase-3-authentication/
│   ├── phase-4-job-management/
│   ├── phase-5-search/
│   ├── phase-6-admin/
│   ├── phase-7-payments/
│   ├── phase-8-chat/
│   ├── phase-9-testing/
│   └── phase-10-deployment/
│
├── testing/
│   ├── unit/                       # Jest unit tests
│   ├── integration/                # Supertest API integration tests
│   ├── e2e/                        # Playwright end-to-end tests
│   └── performance/                # k6 load tests
│
├── deployment/
│   ├── docker/                     # Dockerfile, docker-compose
│   ├── k8s/                        # Kubernetes manifests
│   ├── infra/                      # Terraform / infrastructure-as-code
│   └── ci/                         # CI/CD pipeline configs
│
└── scripts/
    ├── dev-automation/             # Local setup, DB reset, seed helpers
    └── ops/                        # Production ops scripts
```

---

## Module Documentation Index

| Module | Owner | Status | Docs |
|--------|-------|--------|------|
| [Authentication](authentication/README.md) | Backend Team | Production | Complete |
| [Jobs](jobs/README.md) | Full-Stack Team | Production | Complete |
| [Companies](companies/README.md) | Full-Stack Team | Production | Complete |
| [Admin](admin/README.md) | Backend Team | In Progress | Draft |
| [Payments](payments/README.md) | Backend Team | Production | Complete |
| [Notifications](notifications/README.md) | Backend Team | Production | Complete |
| [Search](search/README.md) | Backend Team | Production | Complete |
| [Chat](chat/README.md) | Full-Stack Team | Planned | Stub |
| [Analytics](analytics/README.md) | Data Team | Planned | Stub |

---

## Documentation Standards

Every module folder contains exactly these 8 files:

| File | Purpose |
|------|---------|
| `README.md` | Module overview, scope, key decisions |
| `requirements.md` | Functional + non-functional requirements |
| `api.md` | REST endpoint reference (method, path, auth, request/response) |
| `database-schema.md` | Table structures, columns, indexes, relationships |
| `frontend-flow.md` | User flows, page components, state management |
| `backend-flow.md` | Request lifecycle, middleware chain, service layer |
| `test-cases.md` | Unit / integration / E2E test cases |
| `jira-notes.md` | Epic, stories, tasks, acceptance criteria |

---

## Naming Conventions

### Files & Folders
- Folders: `kebab-case` (e.g., `job-management/`, `phase-3-authentication/`)
- React components: `PascalCase.jsx` (e.g., `JobCard.jsx`, `SeekerDashboard.jsx`)
- Utilities/hooks: `camelCase.js` (e.g., `useAuth.js`, `helpers.js`)
- Services: `camelCase.service.js` (e.g., `auth.service.js`, `jobs.service.js`)
- Controllers: `camelCase.controller.js`
- Routes: `camelCase.routes.js`
- Models: `PascalCase.js` (e.g., `JobListing.js`, `SeekerProfile.js`)
- Migrations: `YYYYMMDDHHMMSS-description.cjs`
- Docs: `kebab-case.md` (e.g., `database-schema.md`, `frontend-flow.md`)

### Database
- Tables: `snake_case` plural (e.g., `job_listings`, `seeker_profiles`)
- Columns: `snake_case` (e.g., `created_at`, `job_type`, `is_active`)
- Indexes: `idx_{table}_{column}` (e.g., `idx_job_listings_status`)
- Foreign keys: `fk_{child_table}_{parent_table}`

### API Endpoints
- Base: `/api/v1/`
- Resources: plural nouns (e.g., `/jobs`, `/users`, `/companies`)
- Actions: HTTP verbs + REST conventions
- Nested: `/api/v1/jobs/:id/applications`

### Git Branches
- Feature: `feature/JP-{ticket}-short-description`
- Bug fix: `fix/JP-{ticket}-short-description`
- Release: `release/v{major}.{minor}.{patch}`
- Hotfix: `hotfix/JP-{ticket}-short-description`

### Commit Messages (Conventional Commits)
```
feat(auth): add OTP-based password reset
fix(jobs): resolve quota check race condition
docs(payments): update Stripe webhook flow
refactor(search): extract FTS query builder
test(auth): add integration tests for refresh token
```

---

## Tech Stack Reference

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS 3 |
| HTTP Client | Axios |
| Server State | TanStack Query v5 |
| Client State | Zustand |
| Forms | React Hook Form + Yup |
| Real-time | Socket.IO client |
| Payments UI | Stripe.js |

### Backend
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 LTS |
| Framework | Express.js 4 |
| ORM | Sequelize 6 + pg |
| Auth | JWT (access 15m + refresh 30d) |
| Payments | Stripe SDK |
| Email | Nodemailer (SMTP) |
| File Upload | Multer |
| Validation | express-validator |
| Scheduling | node-cron |
| Real-time | Socket.IO |

### Infrastructure
| Service | Technology |
|---------|-----------|
| Database | PostgreSQL 15 |
| Cache | Redis (sessions, rate limits) |
| File Storage | AWS S3 / Cloudinary |
| Search | PostgreSQL FTS (tsvector) |
| CI/CD | GitHub Actions |
| Containerization | Docker + Docker Compose |
| Hosting | Railway / Render / AWS ECS |

---

## Environment Variables Quick Reference

### client/.env
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=JobPortal
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_SOCKET_URL=http://localhost:5000
```

### server/.env
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/jobportal_dev
JWT_SECRET=your_32_char_secret
JWT_REFRESH_SECRET=your_32_char_refresh_secret
CLIENT_URL=http://localhost:3000
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_user
EMAIL_PASS=your_pass
EMAIL_FROM=noreply@jobportal.com
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=jobportal-uploads
```

---

## Quick Start

```bash
# Clone repo
git clone https://github.com/your-org/Monster.com-replica.git
cd Monster.com-replica

# Install root dependencies
npm install

# Install client + server dependencies
cd client && npm install
cd ../server && npm install

# Set up environment
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit both .env files with your values

# Run database migrations
cd server && npm run db:migrate && npm run db:seed

# Start dev servers (from root)
npm run dev
# → client: http://localhost:5173
# → server: http://localhost:5000
```

---

## Related Documentation

- [Git Branching Strategy](git/BRANCHING_STRATEGY.md)
- [Commit Convention](git/COMMIT_CONVENTION.md)
- [Git Workflow](git/GIT_WORKFLOW.md)
- [Release Strategy](git/RELEASE_STRATEGY.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Changelog](../CHANGELOG.md)
