# Authentication Module

> Secure, stateless JWT-based authentication with email verification, OTP password reset, and role-based access control.

---

## Overview

The Authentication module handles all identity management for the Job Portal. It supports three user roles (`seeker`, `employer`, `admin`) and uses a dual-token strategy: short-lived access tokens (15 min) and long-lived refresh tokens (30 days stored in httpOnly cookies).

**Scope:**
- User registration (seeker and employer)
- Email verification (tokenized link)
- Login with account lockout (5 attempts → 15 min lock)
- Access token + refresh token lifecycle
- OTP-based password reset (6-digit, 10 min TTL)
- Role-based route protection via middleware
- Logout with token revocation

**Out of scope:** OAuth (Google/LinkedIn) — planned for Phase 2.

---

## Key Files

### Backend
| File | Responsibility |
|------|---------------|
| `server/src/controllers/auth.controller.js` | HTTP request/response handling |
| `server/src/services/authService.js` | Business logic (register, login, reset) |
| `server/src/middleware/auth.middleware.js` | JWT verification, `authenticateToken` |
| `server/src/middleware/authorize.js` | `authorizeRole(...roles)` factory |
| `server/src/utils/jwt.utils.js` | Token generation and verification |
| `server/src/utils/email.utils.js` | Nodemailer email templates |
| `server/src/models/User.js` | User Sequelize model |
| `server/src/routes/auth.routes.js` | Route definitions |

### Frontend
| File | Responsibility |
|------|---------------|
| `client/src/context/AuthContext.jsx` | Global auth state (user, token, logout) |
| `client/src/hooks/useAuth.js` | Hook to consume AuthContext |
| `client/src/services/auth.service.js` | Axios calls to auth endpoints |
| `client/src/pages/Login.jsx` | Login form with error handling |
| `client/src/pages/Register.jsx` | Role-based registration form |
| `client/src/pages/ForgotPassword.jsx` | OTP request + verify + reset flow |
| `client/src/components/common/ProtectedRoute.jsx` | Redirect unauthenticated users |
| `client/src/components/common/RoleRoute.jsx` | Redirect wrong-role users |

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Dual-token (access + refresh) | Access token is stateless and short-lived; refresh token allows session extension without re-login |
| httpOnly cookie for refresh token | Cannot be read by JS — protects against XSS |
| bcrypt rounds = 12 | Industry standard for password hashing; ~250ms per hash prevents brute force |
| OTP stored as SHA-256 hash | DB breach does not expose raw OTPs |
| Account lockout after 5 attempts | Mitigates brute-force attacks |
| Profile created on register | One atomic operation; no orphaned user records |

---

## User Roles

| Role | Description | Auto-created Profile |
|------|-------------|---------------------|
| `seeker` | Job seeker browsing and applying | `SeekerProfile` |
| `employer` | Company posting jobs and managing ATS | `EmployerProfile` |
| `admin` | Platform administrator | None (direct DB) |

---

## Related Docs

- [Requirements](requirements.md)
- [API Reference](api.md)
- [Database Schema](database-schema.md)
- [Frontend Flow](frontend-flow.md)
- [Backend Flow](backend-flow.md)
- [Test Cases](test-cases.md)
- [Jira Notes](jira-notes.md)
