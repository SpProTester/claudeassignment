# Authentication — Requirements

---

## Functional Requirements

### FR-AUTH-001: User Registration
- System SHALL allow users to register with email, password, full name, and role (`seeker` or `employer`)
- Employer registration SHALL additionally require company name
- System SHALL validate email uniqueness before creating the account
- System SHALL hash the password using bcrypt with cost factor ≥ 12
- System SHALL create the role-specific profile (`SeekerProfile` or `EmployerProfile`) in the same transaction
- System SHALL send an email verification link within 30 seconds of registration

### FR-AUTH-002: Email Verification
- System SHALL generate a cryptographically random 32-byte hex token
- System SHALL store the SHA-256 hash of the token with a 24-hour expiry
- System SHALL set `is_verified = true` only after the user clicks the correct link
- System SHALL send a welcome email upon successful verification

### FR-AUTH-003: Login
- System SHALL authenticate users by email + password comparison (bcrypt)
- System SHALL return a 15-minute access token (JWT) and a 30-day refresh token
- System SHALL set the refresh token in an httpOnly, SameSite=Strict cookie
- System SHALL reject login if `is_active = false`
- System SHALL increment `failed_login_attempts` on each failed login
- System SHALL lock the account for 15 minutes after 5 consecutive failures
- System SHALL reset `failed_login_attempts` to 0 on successful login
- System SHALL update `last_login_at` and `login_count` on successful login

### FR-AUTH-004: Token Refresh
- System SHALL issue a new access token when a valid refresh token is presented
- System SHALL rotate the refresh token on each refresh (issue new one, revoke old)
- System SHALL reject revoked or expired refresh tokens with HTTP 401

### FR-AUTH-005: Logout
- System SHALL revoke the refresh token on logout
- System SHALL clear the httpOnly cookie on logout

### FR-AUTH-006: Password Reset
- System SHALL send a 6-digit OTP to the registered email address
- System SHALL store the OTP as a SHA-256 hash with a 10-minute expiry
- System SHALL always return HTTP 200 from the forgot-password endpoint (prevents email enumeration)
- System SHALL invalidate all existing refresh tokens after a successful password reset

### FR-AUTH-007: Role-Based Access Control
- System SHALL reject requests from unauthenticated users with HTTP 401
- System SHALL reject requests from insufficiently-privileged users with HTTP 403
- System SHALL expose `authorizeRole('employer')` and `authorizeRole('admin')` middleware

---

## Non-Functional Requirements

### NFR-AUTH-001: Security
- Passwords MUST be hashed; plain-text passwords MUST NOT be stored or logged
- JWT secrets MUST be ≥ 32 random bytes, loaded from environment variables
- Error messages MUST NOT reveal whether an email address is registered
- All auth endpoints MUST be rate-limited (max 10 requests per minute per IP)

### NFR-AUTH-002: Performance
- Login endpoint MUST respond within 500ms under normal load (p95)
- Token verification middleware MUST add < 5ms overhead per request

### NFR-AUTH-003: Reliability
- Auth service MUST handle database connection failures gracefully (return 503)
- Email sending failures MUST NOT block registration (async, non-blocking)

### NFR-AUTH-004: Compliance
- Refresh tokens MUST be stored as httpOnly cookies (OWASP XSS mitigation)
- Sensitive fields (`password_hash`, `otp_hash`) MUST be excluded from all API responses
- All auth events MUST be logged with timestamp, IP, and user ID (for audit)

---

## Acceptance Criteria

- [ ] `POST /api/auth/register` creates a user and associated profile
- [ ] `POST /api/auth/login` returns access token and sets refresh cookie
- [ ] `GET /api/auth/me` returns user data for valid Bearer token
- [ ] `POST /api/auth/refresh` issues new tokens from cookie
- [ ] `POST /api/auth/logout` revokes refresh token and clears cookie
- [ ] 5th failed login locks account; 6th attempt returns 423 with retry-after header
- [ ] `POST /api/auth/forgot-password` returns 200 whether email exists or not
- [ ] `POST /api/auth/reset-password` with valid OTP updates password and invalidates refresh tokens
- [ ] Protected routes return 401 without token, 403 with wrong role
