# Authentication — Jira Notes

---

## Epic: JP-AUTH — Authentication & Authorization

**Goal:** Implement secure, role-based authentication for all three user types.
**Priority:** Critical (blocks all other modules)
**Status:** Done

---

## Stories

### JP-AUTH-001: User Registration
**As a** visitor, **I want to** create an account as a job seeker or employer, **so that** I can access role-specific features.

**Acceptance Criteria:**
- [ ] Registration form with role selector (Seeker / Employer)
- [ ] Employer form shows company_name field
- [ ] Weak passwords rejected with specific feedback
- [ ] Duplicate email shows friendly error
- [ ] Verification email sent within 30s
- [ ] User cannot log in before email is verified

**Story Points:** 5 | **Assignee:** Backend Dev

---

### JP-AUTH-002: Login & Token Management
**As a** registered user, **I want to** log in with email and password, **so that** I receive secure tokens and can access my dashboard.

**Acceptance Criteria:**
- [ ] Access token returned in response body (memory storage)
- [ ] Refresh token set in httpOnly cookie
- [ ] Role-based redirect after login
- [ ] Token auto-refresh on 401 (Axios interceptor)
- [ ] Session persists on page refresh

**Story Points:** 5 | **Assignee:** Full-Stack Dev

---

### JP-AUTH-003: Account Lockout
**As a** platform admin, **I want to** lock accounts after repeated failures, **so that** brute-force attacks are mitigated.

**Acceptance Criteria:**
- [ ] Account locked after 5 consecutive failures
- [ ] Lock duration: 15 minutes
- [ ] 423 response includes `retryAfter` seconds
- [ ] UI shows lockout countdown timer
- [ ] Successful login resets failure counter

**Story Points:** 3 | **Assignee:** Backend Dev

---

### JP-AUTH-004: Email Verification
**As a** registered user, **I want to** verify my email address, **so that** I can fully activate my account.

**Acceptance Criteria:**
- [ ] Token-based link in email (not OTP)
- [ ] Token expires in 24 hours
- [ ] Resend verification email option
- [ ] Welcome email sent after successful verification

**Story Points:** 3 | **Assignee:** Backend Dev

---

### JP-AUTH-005: Password Reset via OTP
**As a** user who forgot their password, **I want to** reset it using an email OTP, **so that** I can regain access without contacting support.

**Acceptance Criteria:**
- [ ] 6-digit OTP sent to registered email
- [ ] OTP expires in 10 minutes
- [ ] Always returns 200 (no email enumeration)
- [ ] Password strength validated before reset
- [ ] All refresh tokens revoked after reset

**Story Points:** 3 | **Assignee:** Backend Dev

---

### JP-AUTH-006: Route Guards (Frontend)
**As a** developer, **I want to** protect routes by auth status and role, **so that** unauthorized users cannot access restricted pages.

**Acceptance Criteria:**
- [ ] Unauthenticated users redirected to /login
- [ ] Seeker cannot access /employer/* routes
- [ ] Employer cannot access /seeker/* routes
- [ ] Loading state shown while session is being restored

**Story Points:** 2 | **Assignee:** Frontend Dev

---

## Tasks Breakdown

| Task | Type | Status |
|------|------|--------|
| Design users + refresh_tokens tables | Backend | Done |
| Implement authService.js | Backend | Done |
| Implement auth controller + routes | Backend | Done |
| Implement JWT utils | Backend | Done |
| Implement email templates (Nodemailer) | Backend | Done |
| Build Login.jsx page | Frontend | Done |
| Build Register.jsx with role selector | Frontend | Done |
| Build ForgotPassword.jsx (3-step OTP) | Frontend | Done |
| Implement AuthContext + useAuth hook | Frontend | Done |
| Implement Axios interceptor (refresh) | Frontend | Done |
| Implement ProtectedRoute + RoleRoute | Frontend | Done |
| Write unit tests for authService | Testing | Done |
| Write integration tests for auth routes | Testing | Done |
| Write E2E tests (register, login, reset) | Testing | In Progress |

---

## Known Limitations / Tech Debt

- OAuth (Google/LinkedIn) is deferred to Phase 2
- MFA (TOTP/FIDO2) is out of scope for MVP
- Refresh token revocation is DB-based (not Redis) — will add Redis blocklist at scale
- Rate limiting uses express-rate-limit (in-memory) — needs Redis store in production multi-instance setup
