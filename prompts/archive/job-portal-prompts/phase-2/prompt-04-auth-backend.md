# Prompt 04 — Authentication Backend

## Phase
Phase 2 — Authentication

## Objective
Build a complete, secure authentication system with JWT (access + refresh tokens), email verification, password reset via OTP, account lockout, and role-based middleware.

---

## Prompt to Use

```
Build a complete authentication system for the Job Portal Node.js/Express backend.

FILES TO CREATE:

1. server/src/utils/jwt.js
   - generateAccessToken(payload) — signs JWT with JWT_SECRET, expires in 15m
     payload: { userId, email, role }
   - generateRefreshToken(payload) — signs JWT with JWT_REFRESH_SECRET, expires in 30d
   - verifyAccessToken(token) — verifies and returns decoded payload or throws
   - verifyRefreshToken(token) — verifies refresh token or throws
   - Both use RS256 if key pair available, fallback to HS256 with secrets

2. server/src/utils/email.js
   - Configure Nodemailer with SMTP from env (EMAIL_HOST, PORT, USER, PASS)
   - sendVerificationEmail(to, name, token) — sends account verification link
   - sendPasswordResetEmail(to, name, otp) — sends 6-digit OTP email
   - sendWelcomeEmail(to, name, role) — welcome email after verification
   - sendApplicationEmail(to, jobTitle, companyName, status) — application status update
   - Use HTML templates (inline, no external template engine needed)
   - Log email sends; catch and log errors without throwing

3. server/src/services/authService.js (business logic — no req/res here):
   - register({ email, password, role, full_name, company_name? }) 
     → Check duplicate email → Create User → Create SeekerProfile or EmployerProfile 
     → Generate email verification token (crypto.randomBytes(32).toString('hex'))
     → Store token hash in DB with 24hr expiry
     → Send verification email
     → Return { user: user.toSafeJSON(), message }
   
   - login({ email, password })
     → Find user by email → Check is_active → Check account lockout
     → validatePassword → on failure: increment failed_login_attempts, lock if ≥5
     → On success: reset failed_login_attempts, update last_login_at, login_count
     → Generate accessToken + refreshToken
     → Return { user, accessToken, refreshToken }
   
   - refreshTokens(refreshToken)
     → Verify refresh token → Find user → Generate new accessToken + refreshToken
     → Return { accessToken, refreshToken }
   
   - logout(refreshToken) — invalidate refresh token (add to blocklist in DB or memory)
   
   - verifyEmail(token)
     → Find user by token hash → Check expiry → Set is_verified=true → Clear token
     → Send welcome email → Return { message }
   
   - forgotPassword(email)
     → Find user → Generate 6-digit OTP → Store hash with 10min expiry
     → Send OTP email → Return { message } (always succeed even if email not found)
   
   - resetPassword(email, otp, newPassword)
     → Find user → Verify OTP hash → Check expiry → Update password_hash
     → Clear OTP → Invalidate all existing refresh tokens → Return { message }

4. server/src/controllers/authController.js
   - register(req, res, next) — calls authService.register, returns 201
   - login(req, res, next) — calls authService.login, sets refreshToken as httpOnly cookie
   - refreshToken(req, res, next) — reads cookie, calls authService.refreshTokens
   - logout(req, res, next) — clears cookie, calls authService.logout
   - verifyEmail(req, res, next)
   - forgotPassword(req, res, next)
   - resetPassword(req, res, next)
   - getMe(req, res) — returns req.user (set by auth middleware)

5. server/src/validators/authValidators.js (express-validator rules):
   - registerRules — email valid, password min 8 chars + 1 uppercase + 1 number + 1 special,
     role in ['seeker','employer'], full_name min 2 chars,
     if role=employer: company_name required
   - loginRules — email valid, password not empty
   - forgotPasswordRules — email valid
   - resetPasswordRules — email valid, otp 6 digits, password strong

6. server/src/middleware/auth.js
   - authenticateToken(req, res, next)
     → Extract Bearer token from Authorization header
     → verifyAccessToken → attach decoded user to req.user
     → If token missing: 401 { error: 'No token provided' }
     → If token invalid/expired: 401 { error: 'Invalid or expired token' }
   
   - optionalAuth(req, res, next)
     → Same as above but calls next() even without token (sets req.user = null)

7. server/src/middleware/authorize.js
   - authorizeRole(...roles) — middleware factory
     → Returns middleware that checks req.user.role is in roles array
     → If not: 403 { error: 'Insufficient permissions' }

8. server/src/routes/auth.js
   - POST /register → registerRules, validate, authController.register
   - POST /login → loginRules, validate, authController.login
   - POST /refresh → authController.refreshToken
   - POST /logout → authenticateToken, authController.logout
   - GET /verify-email/:token → authController.verifyEmail
   - POST /forgot-password → forgotPasswordRules, validate, authController.forgotPassword
   - POST /reset-password → resetPasswordRules, validate, authController.resetPassword
   - GET /me → authenticateToken, authController.getMe

9. server/src/middleware/errorHandler.js
   - Global Express error handler (4 params: err, req, res, next)
   - Handle Sequelize ValidationError → 400 with field errors
   - Handle Sequelize UniqueConstraintError → 409 with duplicate message
   - Handle JWT errors → 401
   - Handle custom AppError class (statusCode, message, isOperational)
   - In development: include stack trace in response
   - In production: only send message, log full error to Winston

ALSO CREATE:
- server/src/utils/AppError.js — custom error class extending Error with statusCode
- server/src/utils/asyncHandler.js — wrap async route handlers to catch errors

REFRESH TOKEN STORAGE:
- Create RefreshToken model: id, user_id, token_hash, expires_at, is_revoked, created_at
- On login: save refresh token hash
- On logout: mark token as revoked
- On refresh: check token not revoked + not expired

Show complete code for ALL files above.
```

---

## Expected Output Files

```
server/src/
├── utils/
│   ├── jwt.js
│   ├── email.js
│   ├── AppError.js
│   └── asyncHandler.js
├── services/
│   └── authService.js
├── controllers/
│   └── authController.js
├── validators/
│   └── authValidators.js
├── middleware/
│   ├── auth.js
│   ├── authorize.js
│   └── errorHandler.js
├── routes/
│   └── auth.js
└── models/
    └── RefreshToken.js
```

---

## Key Concepts to Learn

- **Access vs Refresh tokens** — access token is short-lived (15 min) for API calls; refresh token is long-lived (30 days) stored in httpOnly cookie to get new access tokens
- **httpOnly cookies** — cannot be read by JavaScript; protects refresh token from XSS attacks
- **bcrypt cost factor** — `bcrypt(12)` means 2^12 iterations; higher = slower but more secure; 10-12 is production standard
- **Token hashing** — never store raw OTPs or tokens in DB; store SHA-256 hash so DB breach doesn't expose them
- **Account lockout** — after N failed attempts, lock for M minutes; prevents brute force
- **asyncHandler wrapper** — instead of try/catch in every controller, wrap with `asyncHandler` and let global error handler catch

---

## API Testing with curl/Postman

```bash
# Register as job seeker
POST http://localhost:5000/api/auth/register
{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "seeker",
  "full_name": "John Doe"
}

# Login
POST http://localhost:5000/api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

# Get current user (with token)
GET http://localhost:5000/api/auth/me
Authorization: Bearer <access_token>

# Forgot password
POST http://localhost:5000/api/auth/forgot-password
{ "email": "john@example.com" }
```

---

## Security Checklist

- [ ] Passwords hashed with bcrypt (rounds ≥ 10)
- [ ] Refresh token stored as httpOnly, SameSite=Strict cookie
- [ ] OTP stored as SHA-256 hash in DB, not plaintext
- [ ] Account locks after 5 failed login attempts
- [ ] Email verification required before login (or allow login, restrict features)
- [ ] Password reset OTP expires in 10 minutes
- [ ] All error messages are generic (don't reveal if email exists)

---

## Validation Checklist

- [ ] `POST /register` creates user + seeker/employer profile
- [ ] `POST /login` returns accessToken, sets refreshToken cookie
- [ ] `GET /me` returns user data when valid Bearer token provided
- [ ] `POST /refresh` issues new tokens from cookie
- [ ] `POST /logout` clears cookie and revokes refresh token
- [ ] 5th failed login locks account for 15 minutes
- [ ] Validation errors return 400 with specific field messages

---

## Next Step
Move to **Prompt 05 — Authentication Frontend** once all auth endpoints work correctly.
