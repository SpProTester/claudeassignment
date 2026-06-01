# Prompt 04 â€” Authentication Backend

## Phase
Phase 2 â€” Authentication

## Objective
Build a complete, secure authentication system with JWT (access + refresh tokens), email verification, password reset via OTP, account lockout, and role-based middleware.

---

## Prompt to Use

```
Build a complete authentication system for the Job Portal Node.js/Express backend.

FILES TO CREATE:

1. server/src/utils/jwt.js
   - generateAccessToken(payload) â€” signs JWT with JWT_SECRET, expires in 15m
     payload: { userId, email, role }
   - generateRefreshToken(payload) â€” signs JWT with JWT_REFRESH_SECRET, expires in 30d
   - verifyAccessToken(token) â€” verifies and returns decoded payload or throws
   - verifyRefreshToken(token) â€” verifies refresh token or throws
   - Both use RS256 if key pair available, fallback to HS256 with secrets

2. server/src/utils/email.js
   - Configure Nodemailer with SMTP from env (EMAIL_HOST, PORT, USER, PASS)
   - sendVerificationEmail(to, name, token) â€” sends account verification link
   - sendPasswordResetEmail(to, name, otp) â€” sends 6-digit OTP email
   - sendWelcomeEmail(to, name, role) â€” welcome email after verification
   - sendApplicationEmail(to, jobTitle, companyName, status) â€” application status update
   - Use HTML templates (inline, no external template engine needed)
   - Log email sends; catch and log errors without throwing

3. server/src/services/authService.js (business logic â€” no req/res here):
   - register({ email, password, role, full_name, company_name? }) 
     â†’ Check duplicate email â†’ Create User â†’ Create SeekerProfile or EmployerProfile 
     â†’ Generate email verification token (crypto.randomBytes(32).toString('hex'))
     â†’ Store token hash in DB with 24hr expiry
     â†’ Send verification email
     â†’ Return { user: user.toSafeJSON(), message }
   
   - login({ email, password })
     â†’ Find user by email â†’ Check is_active â†’ Check account lockout
     â†’ validatePassword â†’ on failure: increment failed_login_attempts, lock if â‰¥5
     â†’ On success: reset failed_login_attempts, update last_login_at, login_count
     â†’ Generate accessToken + refreshToken
     â†’ Return { user, accessToken, refreshToken }
   
   - refreshTokens(refreshToken)
     â†’ Verify refresh token â†’ Find user â†’ Generate new accessToken + refreshToken
     â†’ Return { accessToken, refreshToken }
   
   - logout(refreshToken) â€” invalidate refresh token (add to blocklist in DB or memory)
   
   - verifyEmail(token)
     â†’ Find user by token hash â†’ Check expiry â†’ Set is_verified=true â†’ Clear token
     â†’ Send welcome email â†’ Return { message }
   
   - forgotPassword(email)
     â†’ Find user â†’ Generate 6-digit OTP â†’ Store hash with 10min expiry
     â†’ Send OTP email â†’ Return { message } (always succeed even if email not found)
   
   - resetPassword(email, otp, newPassword)
     â†’ Find user â†’ Verify OTP hash â†’ Check expiry â†’ Update password_hash
     â†’ Clear OTP â†’ Invalidate all existing refresh tokens â†’ Return { message }

4. server/src/controllers/authController.js
   - register(req, res, next) â€” calls authService.register, returns 201
   - login(req, res, next) â€” calls authService.login, sets refreshToken as httpOnly cookie
   - refreshToken(req, res, next) â€” reads cookie, calls authService.refreshTokens
   - logout(req, res, next) â€” clears cookie, calls authService.logout
   - verifyEmail(req, res, next)
   - forgotPassword(req, res, next)
   - resetPassword(req, res, next)
   - getMe(req, res) â€” returns req.user (set by auth middleware)

5. server/src/validators/authValidators.js (express-validator rules):
   - registerRules â€” email valid, password min 8 chars + 1 uppercase + 1 number + 1 special,
     role in ['seeker','employer'], full_name min 2 chars,
     if role=employer: company_name required
   - loginRules â€” email valid, password not empty
   - forgotPasswordRules â€” email valid
   - resetPasswordRules â€” email valid, otp 6 digits, password strong

6. server/src/middleware/auth.js
   - authenticateToken(req, res, next)
     â†’ Extract Bearer token from Authorization header
     â†’ verifyAccessToken â†’ attach decoded user to req.user
     â†’ If token missing: 401 { error: 'No token provided' }
     â†’ If token invalid/expired: 401 { error: 'Invalid or expired token' }
   
   - optionalAuth(req, res, next)
     â†’ Same as above but calls next() even without token (sets req.user = null)

7. server/src/middleware/authorize.js
   - authorizeRole(...roles) â€” middleware factory
     â†’ Returns middleware that checks req.user.role is in roles array
     â†’ If not: 403 { error: 'Insufficient permissions' }

8. server/src/routes/auth.js
   - POST /register â†’ registerRules, validate, authController.register
   - POST /login â†’ loginRules, validate, authController.login
   - POST /refresh â†’ authController.refreshToken
   - POST /logout â†’ authenticateToken, authController.logout
   - GET /verify-email/:token â†’ authController.verifyEmail
   - POST /forgot-password â†’ forgotPasswordRules, validate, authController.forgotPassword
   - POST /reset-password â†’ resetPasswordRules, validate, authController.resetPassword
   - GET /me â†’ authenticateToken, authController.getMe

9. server/src/middleware/errorHandler.js
   - Global Express error handler (4 params: err, req, res, next)
   - Handle Sequelize ValidationError â†’ 400 with field errors
   - Handle Sequelize UniqueConstraintError â†’ 409 with duplicate message
   - Handle JWT errors â†’ 401
   - Handle custom AppError class (statusCode, message, isOperational)
   - In development: include stack trace in response
   - In production: only send message, log full error to Winston

ALSO CREATE:
- server/src/utils/AppError.js â€” custom error class extending Error with statusCode
- server/src/utils/asyncHandler.js â€” wrap async route handlers to catch errors

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
â”œâ”€â”€ utils/
â”‚   â”œâ”€â”€ jwt.js
â”‚   â”œâ”€â”€ email.js
â”‚   â”œâ”€â”€ AppError.js
â”‚   â””â”€â”€ asyncHandler.js
â”œâ”€â”€ services/
â”‚   â””â”€â”€ authService.js
â”œâ”€â”€ controllers/
â”‚   â””â”€â”€ authController.js
â”œâ”€â”€ validators/
â”‚   â””â”€â”€ authValidators.js
â”œâ”€â”€ middleware/
â”‚   â”œâ”€â”€ auth.js
â”‚   â”œâ”€â”€ authorize.js
â”‚   â””â”€â”€ errorHandler.js
â”œâ”€â”€ routes/
â”‚   â””â”€â”€ auth.js
â””â”€â”€ models/
    â””â”€â”€ RefreshToken.js
```

---

## Key Concepts to Learn

- **Access vs Refresh tokens** â€” access token is short-lived (15 min) for API calls; refresh token is long-lived (30 days) stored in httpOnly cookie to get new access tokens
- **httpOnly cookies** â€” cannot be read by JavaScript; protects refresh token from XSS attacks
- **bcrypt cost factor** â€” `bcrypt(12)` means 2^12 iterations; higher = slower but more secure; 10-12 is production standard
- **Token hashing** â€” never store raw OTPs or tokens in DB; store SHA-256 hash so DB breach doesn't expose them
- **Account lockout** â€” after N failed attempts, lock for M minutes; prevents brute force
- **asyncHandler wrapper** â€” instead of try/catch in every controller, wrap with `asyncHandler` and let global error handler catch

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

- [ ] Passwords hashed with bcrypt (rounds â‰¥ 10)
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
Move to **Prompt 05 â€” Authentication Frontend** once all auth endpoints work correctly.

