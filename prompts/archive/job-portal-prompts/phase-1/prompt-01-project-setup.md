# Prompt 01 — Project Setup & Folder Structure

## Phase
Phase 1 — Foundation

## Objective
Initialize a full-stack Job Portal monorepo project with React JS (frontend) and Node.js (backend), configure all tooling, and establish a clean, scalable folder structure.

---

## Prompt to Use

```
Create a full-stack Job Portal project with the following setup:

FRONTEND (client/):
- React 18 with Vite (not Create React App)
- React Router v6 for routing
- Tailwind CSS for styling
- Axios for HTTP requests
- React Query (TanStack Query v5) for server state
- Zustand for global client state
- React Hook Form + Yup for form validation

BACKEND (server/):
- Node.js with Express.js
- ES Modules (type: "module" in package.json)
- dotenv for environment variables
- cors, helmet, morgan for middleware
- nodemon for development auto-reload
- express-validator for input validation

STRUCTURE REQUIRED:
job-portal/
├── client/                        # React frontend
│   ├── public/
│   ├── src/
│   │   ├── api/                   # Axios instance and API calls
│   │   ├── assets/                # Images, icons, fonts
│   │   ├── components/
│   │   │   ├── ui/                # Reusable UI (Button, Input, Modal, Badge)
│   │   │   ├── layout/            # Header, Footer, Sidebar, Layout wrappers
│   │   │   └── shared/            # Shared feature components
│   │   ├── features/
│   │   │   ├── auth/              # Login, Register, ForgotPassword
│   │   │   ├── seeker/            # Seeker dashboard, profile, applications
│   │   │   ├── employer/          # Employer dashboard, job posting, ATS
│   │   │   └── admin/             # Admin panel pages
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── pages/                 # Route-level page components
│   │   │   ├── public/            # Home, Jobs, JobDetail, CompanyProfile
│   │   │   ├── auth/
│   │   │   ├── seeker/
│   │   │   ├── employer/
│   │   │   └── admin/
│   │   ├── store/                 # Zustand stores
│   │   ├── utils/                 # Helpers (formatDate, formatSalary, etc.)
│   │   ├── constants/             # App constants (JOB_TYPES, ATS_STAGES, etc.)
│   │   ├── App.jsx                # Root component with router setup
│   │   └── main.jsx               # Vite entry point
│   ├── .env.example
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                        # Node.js backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js        # Sequelize connection
│   │   │   └── env.js             # Validated env config
│   │   ├── models/                # Sequelize models
│   │   ├── routes/                # Express route definitions
│   │   ├── controllers/           # Route handler logic
│   │   ├── services/              # Business logic layer
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verify middleware
│   │   │   ├── authorize.js       # Role-based access control
│   │   │   ├── validate.js        # express-validator error handler
│   │   │   ├── rateLimiter.js     # Rate limiting rules
│   │   │   └── errorHandler.js    # Global error handler
│   │   ├── utils/
│   │   │   ├── jwt.js             # Token generation/verification
│   │   │   ├── email.js           # Nodemailer setup
│   │   │   ├── logger.js          # Winston logger
│   │   │   └── helpers.js         # Slug generation, pagination, etc.
│   │   ├── validators/            # express-validator rule sets per route
│   │   └── app.js                 # Express app setup (middleware, routes)
│   ├── server.js                  # Entry point (starts HTTP server)
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md

SHOW:
1. Complete package.json for both client/ and server/ with all dependencies
2. vite.config.js with path aliases (@/ for src/)
3. tailwind.config.js with custom theme colors for the job portal
4. server/src/app.js with all middleware wired up
5. server/server.js entry point
6. client/src/api/axiosInstance.js with base URL from env, request interceptor (attach token), response interceptor (handle 401)
7. Both .env.example files with all required variables
8. .gitignore for the monorepo
9. README.md with setup instructions
```

---

## Expected Output Files

| File | Purpose |
|------|---------|
| `client/package.json` | React dependencies |
| `server/package.json` | Node.js dependencies |
| `client/vite.config.js` | Vite + path aliases |
| `client/tailwind.config.js` | Design tokens |
| `server/src/app.js` | Express app |
| `server/server.js` | HTTP entry point |
| `client/src/api/axiosInstance.js` | Configured Axios |
| `.env.example` (both) | Environment templates |

---

## Key Concepts to Learn

- **Monorepo structure** — organizing frontend and backend in one repository
- **Vite** — faster alternative to Create React App; understand `vite.config.js` aliases
- **ES Modules in Node.js** — `import/export` syntax, `"type": "module"` in package.json
- **Axios interceptors** — automatically attach JWT token to every request
- **Tailwind custom theme** — defining brand colors and design tokens

---

## Environment Variables Needed

### client/.env
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=JobPortal
```

### server/.env
```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/jobportal
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CLIENT_URL=http://localhost:3000
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_user
EMAIL_PASS=your_mailtrap_pass
EMAIL_FROM=noreply@jobportal.com
```

---

## Validation Checklist

- [ ] `npm install` works in both `client/` and `server/`
- [ ] `npm run dev` starts Vite dev server on port 3000
- [ ] `npm run dev` starts Nodemon server on port 5000
- [ ] `http://localhost:5000/health` returns `{ status: "ok" }`
- [ ] Tailwind CSS applies styles in the React app
- [ ] Path alias `@/components/...` resolves correctly in React

---

## Next Step
Move to **Prompt 02 — Database Setup** once the project structure is running.
