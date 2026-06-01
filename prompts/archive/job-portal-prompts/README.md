# Job Portal & Recruitment Platform
## Complete Build Guide — 25 Step-by-Step Prompts

**Stack:** React JS · Node.js · Express · PostgreSQL · Sequelize · Socket.io · Stripe · OpenAI

---

## 📋 Prompt Index

### Phase 1 — Foundation (Prompts 01–03)
| # | File | What You Build |
|---|------|---------------|
| 01 | `phase-1/prompt-01-project-setup.md` | Monorepo, Vite, Tailwind, Express, folder structure |
| 02 | `phase-1/prompt-02-database-setup.md` | PostgreSQL, Sequelize, connection pooling, migrations |
| 03 | `phase-1/prompt-03-database-models.md` | All 16 Sequelize models with associations and indexes |

### Phase 2 — Authentication (Prompts 04–05)
| # | File | What You Build |
|---|------|---------------|
| 04 | `phase-2/prompt-04-auth-backend.md` | JWT, bcrypt, refresh tokens, OTP, account lockout |
| 05 | `phase-2/prompt-05-auth-frontend.md` | Login, Register, ForgotPassword, ProtectedRoute, Zustand |

### Phase 3 — Job Seeker Module (Prompts 06–08)
| # | File | What You Build |
|---|------|---------------|
| 06 | `phase-3/prompt-06-seeker-profile-backend.md` | Profile CRUD, experience, education, skills APIs |
| 07 | `phase-3/prompt-07-resume-upload.md` | Multer upload, PDF parsing, file security |
| 08 | `phase-3/prompt-08-seeker-frontend.md` | Seeker dashboard, profile editor, resume manager |

### Phase 4 — Employer Module (Prompts 09–11)
| # | File | What You Build |
|---|------|---------------|
| 09 | `phase-4/prompt-09-employer-job-posting.md` | Job CRUD, quota enforcement, cron expiry |
| 10 | `phase-4/prompt-10-ats-backend.md` | ATS stages, notes, ratings, interview scheduling |
| 11 | `phase-4/prompt-11-employer-frontend.md` | Kanban board, multi-step job form, analytics charts |

### Phase 5 — Search & Public Pages (Prompts 12–13)
| # | File | What You Build |
|---|------|---------------|
| 12 | `phase-5/prompt-12-search-backend.md` | PostgreSQL FTS, tsvector, multi-filter search, autocomplete |
| 13 | `phase-5/prompt-13-public-frontend.md` | Homepage, search results, job detail, company profile |

### Phase 6 — Notifications & Alerts (Prompts 14–15)
| # | File | What You Build |
|---|------|---------------|
| 14 | `phase-6/prompt-14-notifications.md` | Socket.io real-time notifications, notification center |
| 15 | `phase-6/prompt-15-job-alerts.md` | Saved searches, email digest cron, unsubscribe flow |

### Phase 7 — Payments (Prompts 16–17)
| # | File | What You Build |
|---|------|---------------|
| 16 | `phase-7/prompt-16-payments-backend.md` | Stripe checkout, webhooks, subscriptions, refunds |
| 17 | `phase-7/prompt-17-billing-frontend.md` | Pricing page, billing dashboard, plan gate component |

### Phase 8 — AI Features (Prompts 18–19)
| # | File | What You Build |
|---|------|---------------|
| 18 | `phase-8/prompt-18-ai-resume-parser.md` | OpenAI GPT-4 resume parsing, profile auto-population |
| 19 | `phase-8/prompt-19-ai-recommendations.md` | Skill-match scoring, candidate recommendations, caching |

### Phase 9 — Admin Module (Prompts 20–21)
| # | File | What You Build |
|---|------|---------------|
| 20 | `phase-9/prompt-20-admin-backend.md` | User management, moderation, analytics, refunds, audit log |
| 21 | `phase-9/prompt-21-admin-frontend.md` | Admin KPI dashboard, user table, revenue charts |

### Phase 10 — Launch (Prompts 22–25)
| # | File | What You Build |
|---|------|---------------|
| 22 | `phase-10/prompt-22-security.md` | Helmet, rate limiting, XSS, CSRF, OWASP checklist |
| 23 | `phase-10/prompt-23-testing.md` | Jest + Supertest backend, Vitest + RTL frontend |
| 24 | `phase-10/prompt-24-deployment.md` | Vercel + Railway + GitHub Actions CI/CD |
| 25 | `phase-10/prompt-25-performance.md` | Redis caching, code splitting, virtual lists, Lighthouse 90+ |

---

## 🗓️ 8-Week Schedule

| Week | Prompts | Focus |
|------|---------|-------|
| Week 1 | 01, 02, 03 | Project setup + all DB models |
| Week 2 | 04, 05 | Auth backend + frontend (login/register fully working) |
| Week 3 | 06, 07, 08 | Complete job seeker experience |
| Week 4 | 09, 10, 11 | Complete employer experience with ATS |
| Week 5 | 12, 13 | Search + all public pages |
| Week 6 | 14, 15, 16, 17 | Notifications + payments |
| Week 7 | 18, 19, 20, 21 | AI features + admin panel |
| Week 8 | 22, 23, 24, 25 | Security + tests + deploy + optimize |

---

## 📦 Complete Tech Stack

### Frontend
- React 18 + Vite
- React Router v6
- Tailwind CSS
- TanStack Query (React Query v5)
- Zustand (state management)
- React Hook Form + Yup
- Axios + interceptors
- Socket.io client
- @dnd-kit (drag and drop)
- Recharts (analytics charts)
- react-window (virtualized lists)
- react-hot-toast
- react-helmet-async

### Backend
- Node.js 20 + Express.js
- Sequelize ORM + PostgreSQL 15
- JSON Web Tokens (jsonwebtoken)
- bcryptjs
- Multer (file uploads)
- Socket.io (real-time)
- node-cron (scheduled jobs)
- Nodemailer (email)
- Stripe (payments)
- OpenAI SDK (AI features)
- ioredis (caching)
- Winston (logging)
- Jest + Supertest (testing)
- PM2 (process management)

### Infrastructure
- Vercel (frontend hosting)
- Railway (backend + PostgreSQL)
- Stripe (payment processing)
- SendGrid (transactional email)
- Redis (caching)
- GitHub Actions (CI/CD)

---

## 🔑 How to Use These Prompts

1. **Read the MD file** — understand the objective and what will be built
2. **Copy the prompt** from the "Prompt to Use" section
3. **Paste to Claude** and implement the code
4. **Run the validation checklist** before moving on
5. **Commit your code** before starting the next prompt
6. Move to **Next Step** when checklist passes

> **Tip:** Each prompt builds on the previous ones. Don't skip steps — each one sets up dependencies for the next.
