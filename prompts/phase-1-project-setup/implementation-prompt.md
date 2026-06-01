# Prompt 01 â€” Project Setup & Folder Structure

## Phase
Phase 1 â€” Foundation

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
â”œâ”€â”€ client/                        # React frontend
â”‚   â”œâ”€â”€ public/
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ api/                   # Axios instance and API calls
â”‚   â”‚   â”œâ”€â”€ assets/                # Images, icons, fonts
â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ ui/                # Reusable UI (Button, Input, Modal, Badge)
â”‚   â”‚   â”‚   â”œâ”€â”€ layout/            # Header, Footer, Sidebar, Layout wrappers
â”‚   â”‚   â”‚   â””â”€â”€ shared/            # Shared feature components
â”‚   â”‚   â”œâ”€â”€ features/
â”‚   â”‚   â”‚   â”œâ”€â”€ auth/              # Login, Register, ForgotPassword
â”‚   â”‚   â”‚   â”œâ”€â”€ seeker/            # Seeker dashboard, profile, applications
â”‚   â”‚   â”‚   â”œâ”€â”€ employer/          # Employer dashboard, job posting, ATS
â”‚   â”‚   â”‚   â””â”€â”€ admin/             # Admin panel pages
â”‚   â”‚   â”œâ”€â”€ hooks/                 # Custom React hooks
â”‚   â”‚   â”œâ”€â”€ pages/                 # Route-level page components
â”‚   â”‚   â”‚   â”œâ”€â”€ public/            # Home, Jobs, JobDetail, CompanyProfile
â”‚   â”‚   â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”‚   â”œâ”€â”€ seeker/
â”‚   â”‚   â”‚   â”œâ”€â”€ employer/
â”‚   â”‚   â”‚   â””â”€â”€ admin/
â”‚   â”‚   â”œâ”€â”€ store/                 # Zustand stores
â”‚   â”‚   â”œâ”€â”€ utils/                 # Helpers (formatDate, formatSalary, etc.)
â”‚   â”‚   â”œâ”€â”€ constants/             # App constants (JOB_TYPES, ATS_STAGES, etc.)
â”‚   â”‚   â”œâ”€â”€ App.jsx                # Root component with router setup
â”‚   â”‚   â””â”€â”€ main.jsx               # Vite entry point
â”‚   â”œâ”€â”€ .env.example
â”‚   â”œâ”€â”€ vite.config.js
â”‚   â”œâ”€â”€ tailwind.config.js
â”‚   â””â”€â”€ package.json
â”‚
â”œâ”€â”€ server/                        # Node.js backend
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ config/
â”‚   â”‚   â”‚   â”œâ”€â”€ database.js        # Sequelize connection
â”‚   â”‚   â”‚   â””â”€â”€ env.js             # Validated env config
â”‚   â”‚   â”œâ”€â”€ models/                # Sequelize models
â”‚   â”‚   â”œâ”€â”€ routes/                # Express route definitions
â”‚   â”‚   â”œâ”€â”€ controllers/           # Route handler logic
â”‚   â”‚   â”œâ”€â”€ services/              # Business logic layer
â”‚   â”‚   â”œâ”€â”€ middleware/
â”‚   â”‚   â”‚   â”œâ”€â”€ auth.js            # JWT verify middleware
â”‚   â”‚   â”‚   â”œâ”€â”€ authorize.js       # Role-based access control
â”‚   â”‚   â”‚   â”œâ”€â”€ validate.js        # express-validator error handler
â”‚   â”‚   â”‚   â”œâ”€â”€ rateLimiter.js     # Rate limiting rules
â”‚   â”‚   â”‚   â””â”€â”€ errorHandler.js    # Global error handler
â”‚   â”‚   â”œâ”€â”€ utils/
â”‚   â”‚   â”‚   â”œâ”€â”€ jwt.js             # Token generation/verification
â”‚   â”‚   â”‚   â”œâ”€â”€ email.js           # Nodemailer setup
â”‚   â”‚   â”‚   â”œâ”€â”€ logger.js          # Winston logger
â”‚   â”‚   â”‚   â””â”€â”€ helpers.js         # Slug generation, pagination, etc.
â”‚   â”‚   â”œâ”€â”€ validators/            # express-validator rule sets per route
â”‚   â”‚   â””â”€â”€ app.js                 # Express app setup (middleware, routes)
â”‚   â”œâ”€â”€ server.js                  # Entry point (starts HTTP server)
â”‚   â”œâ”€â”€ .env.example
â”‚   â””â”€â”€ package.json
â”‚
â”œâ”€â”€ .gitignore
â””â”€â”€ README.md

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

- **Monorepo structure** â€” organizing frontend and backend in one repository
- **Vite** â€” faster alternative to Create React App; understand `vite.config.js` aliases
- **ES Modules in Node.js** â€” `import/export` syntax, `"type": "module"` in package.json
- **Axios interceptors** â€” automatically attach JWT token to every request
- **Tailwind custom theme** â€” defining brand colors and design tokens

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
Move to **Prompt 02 â€” Database Setup** once the project structure is running.

