# Monster.com Replica — Claude Code Guide

## Project Overview

Full-stack job portal built with React + Node.js + PostgreSQL. Monster.com-style UI with a purple brand (#7600CF).

**Three separate apps:**
- `client/` — Main job portal (seekers & employers), port 5173
- `client-admin/` — Separate admin portal, port 5174
- `server/` — Express REST API + Socket.io, port 5000

---

## Quick Start

```bash
# Install all dependencies
npm run install:all

# Run all three apps simultaneously
npm run dev

# Or run individually
npm run dev:client     # port 5173
npm run dev:admin      # port 5174
npm run dev:server     # port 5000
```

**Prerequisites:** Node >= 20, PostgreSQL running on localhost:5432.

Copy `.env.example` → `.env` in `server/` before first run.

---

## Architecture

```
client/                     # React 18 + Vite + Tailwind (seekers & employers)
client-admin/               # React 18 + Vite + Tailwind (admin portal)
server/                     # Express 4 + Sequelize 6 + PostgreSQL
  src/
    config/                 # Database, Stripe, file paths
    controllers/            # Route handlers (thin — delegate to services)
    middleware/             # Auth, error, validation, file upload
    migrations/             # Sequelize CLI migrations (33+, all .cjs)
    models/                 # Sequelize models + associations in index.js
    routes/                 # Route definitions + aggregated in index.js
    services/               # Business logic, cron jobs, file handling
    utils/                  # JWT, email, response helpers
    socket.js               # Socket.io init + auth
    app.js                  # Express setup (CORS, middleware, routes)
    index.js                # Server entry + cron startup
```

---

## Database

PostgreSQL + Sequelize ORM.

```bash
cd server

npm run db:create           # Create database
npm run db:migrate          # Run all pending migrations
npm run db:migrate:undo     # Undo last migration
npm run db:seed             # Seed dev data
npm run db:reset            # Undo + migrate + seed (destructive)
```

**Migration files:** `server/src/migrations/` — named `YYYYMMDDHHMMSS-description.cjs` (CommonJS).

**When adding a new model:**
1. Create migration file in `server/src/migrations/`
2. Create model in `server/src/models/`
3. Add associations in `server/src/models/index.js`
4. Run `npm run db:migrate` from `server/`

---

## Key Models

| Model | Role |
|---|---|
| `User` | Base auth — role: `seeker \| employer \| admin` |
| `SeekerProfile` | Extended seeker data, view count |
| `EmployerProfile` | Company data, Stripe subscription fields |
| `JobListing` | Job posts with FTS on title + description |
| `Application` | ATS stages: `applied → screening → interview → offer → rejected \| hired` |
| `Resume` | Uploaded PDFs + builder-created resumes |
| `ResumeTemplate` | 5 built-in templates (Corporate, Creative, Executive, Minimal, Modern) |
| `Notification` | In-app notifications (Socket.io) |
| `JobAlert` | Email alerts matched by cron job |
| `BillingEvent` | Stripe payment history |
| `AuditLog` | Admin action trail |

---

## API Structure

Base URL: `http://localhost:5000/api`

| Prefix | Controller |
|---|---|
| `/auth` | Register, login, refresh, logout, password reset |
| `/jobs` | Search (FTS), categories, trending, CRUD |
| `/applications` | Apply, list, ATS stage updates |
| `/seekers` | Profile, experience, education, certifications, resumes, alerts, saved jobs |
| `/employer/jobs` | Employer job management + ATS board |
| `/companies` | Company search + profiles |
| `/notifications` | In-app notifications |
| `/payments` | Stripe checkout, webhook, subscription management |
| `/admin` | User/job/category management, dashboard stats |

**Stripe webhook** at `POST /api/payments/webhook` requires raw body — do not apply JSON middleware to this route.

---

## Frontend Structure (client/)

```
src/
  components/
    common/         # Navbar, Footer, Button, Input, Toast, NotificationBell
    resume/         # ResumePreview + 5 template components
    seeker/         # SeekerLayout + ProfileModals (Education, Experience, etc.)
    employer/       # EmployerLayout
    billing/        # PlanGate, PricingCard, UpgradeModal
  context/
    AuthContext.jsx # JWT state — login/logout/refresh
  hooks/
    useAuth.js      # Auth context hook
    useBilling.js   # Subscription tier checks
    useDebounce.js  # Search input debouncing
    useSocket.js    # Real-time notification hook
  pages/
    employer/       # Dashboard, Jobs, JobForm, ApplicantsBoard, Billing
    seeker/         # Dashboard, Profile, Resume, ResumeBuilder, Applications, SavedJobs, Alerts
  services/         # Axios-based API calls per domain
  store/            # Zustand (seekerStore, uiStore)
  routes/
    index.jsx       # React Router v6 routes
  utils/
    helpers.js      # formatDate, formatSalary, formatCurrency
```

**State management:** React Query for server state, Zustand for client state.

**API calls:** All go through `src/services/api.js` (Axios instance with auth headers). Vite proxies `/api` → `localhost:5000`.

---

## Frontend Routes (client/)

| Path | Access |
|---|---|
| `/`, `/jobs`, `/jobs/:slug`, `/companies/:slug` | Public |
| `/pricing`, `/salary-tools`, `/career-advice` | Public |
| `/about`, `/contact`, `/privacy-policy`, `/terms`, `/accessibility` | Public |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Public |
| `/dashboard` | Protected (role-based redirect) |
| `/seeker/*` | Protected — role: `seeker` |
| `/employer/*` | Protected — role: `employer \| admin` |

---

## Admin Portal (client-admin/)

Separate React app on port 5174. Has its own `AdminAuthContext` and routing. Uses Recharts for dashboard charts and a dark Tailwind theme (slate-900 sidebar).

Routes: `/dashboard`, `/employers`, `/seekers`, `/users`, `/jobs`, `/applications`, `/subscriptions`, `/reports`, `/analytics`, `/audit-log`, `/settings/categories`, `/settings/admins`.

---

## Authentication

- JWT with access + refresh tokens stored in HTTP-only cookies
- `authenticateToken` middleware in `server/src/middleware/auth.middleware.js`
- `restrictTo(...roles)` for role-based access
- Password reset via OTP (email via Nodemailer)
- Admin portal has its own auth flow (`/api/admin/auth`)

---

## Resume Builder

- 5 templates stored as `ResumeTemplate` records in DB
- Drag-and-drop sections via `@dnd-kit`
- PDF export via `pdfkit` at `GET /api/seekers/resumes/built/:id/pdf`
- Resume parsing (uploaded PDFs) via `pdf-parse` in `server/src/services/file.service.js`
- Builder page: `client/src/pages/seeker/ResumeBuilder.jsx`

---

## Real-time & Background Jobs

- **Socket.io** — notification delivery; initialized in `server/src/socket.js`, auth required
- **Job alerts cron** — `server/src/services/job-alert.cron.js` (node-cron, emails matching jobs)
- **Job expiry cron** — `server/src/services/job-expiry.cron.js` (marks expired listings)
- Both crons start in `server/src/index.js`

---

## Payments (Stripe)

- Subscription tiers: `free`, `professional`, `business`
- Stripe fields on `EmployerProfile`: `stripeCustomerId`, `subscriptionId`, `subscriptionTier`, `subscriptionStatus`
- Dev mode: `payments.dev.controller.js` (mock payments, no real Stripe calls)
- Webhook: `POST /api/payments/webhook` — raw body required
- `STRIPE_PRICE_*` env vars map to Stripe price IDs per tier

---

## Design System

- **Primary color:** `#7600CF` (purple)
- **CSS framework:** Tailwind CSS 3 with custom config
- **Admin theme:** Dark slate (`slate-900` sidebar)
- **Component classes:** Defined in `tailwind.config.js` — `btn-primary`, `card`, etc.
- **Font:** System sans-serif stack
- Responsive mobile-first layout

---

## Code Conventions

- **ESLint + Prettier** — run `npm run lint` and `npm run format` from root
- **Prettier config:** `singleQuote: true`, `semi: true`, `tabWidth: 2`, `printWidth: 100`
- **Commits:** Conventional Commits format (`feat:`, `fix:`, `chore:`, etc.) — enforced by Husky
- **Migration files:** CommonJS (`.cjs`), named `YYYYMMDDHHMMSS-description.cjs`
- **Controllers** are thin — delegate business logic to services
- **API responses** use `server/src/utils/response.utils.js` helpers for consistent shape

---

## Environment Variables

Copy `server/.env.example` → `server/.env`. Key vars:

| Group | Variables |
|---|---|
| Database | `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` |
| JWT | `JWT_SECRET`, `JWT_REFRESH_SECRET` |
| CORS | `CLIENT_URL=http://localhost:5173`, `ADMIN_CLIENT_URL=http://localhost:5174` |
| Email | `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PROFESSIONAL`, `STRIPE_PRICE_BUSINESS` |
| App | `NODE_ENV`, `PORT=5000`, `BCRYPT_ROUNDS` |

Client env: `client/.env` with `VITE_API_URL`, `VITE_APP_NAME`.

---

## Testing

Test files are in `testing/` (unit, integration, e2e, performance). Module-level test cases are in `docs/<module>/test-cases.md`.

---

## Docs

- `docs/` — Per-module documentation (auth, jobs, search, payments, notifications, companies, admin, analytics)
- `database/README.md` — Migration guide and schema reference
- `CONTRIBUTING.md` — Full local setup walkthrough
