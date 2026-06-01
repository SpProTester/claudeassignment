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


# Prompt 05 â€” Authentication Frontend

## Phase
Phase 2 â€” Authentication

## Objective
Build complete authentication UI in React with protected routes, role-based guards, global auth state via Context API, and automatic token refresh via Axios interceptors.

---

## Prompt to Use

```
Build the complete authentication frontend for the Job Portal React app.

1. client/src/store/authStore.js (Zustand store):
   - State: user(null), accessToken(null), isAuthenticated(false), isLoading(true)
   - Actions:
     - setAuth(user, accessToken) â€” set authenticated state
     - clearAuth() â€” reset to logged out state
     - updateUser(userData) â€” update user fields without clearing token
   - Persist user to localStorage (NOT the access token â€” keep in memory only)
   - On app load: check localStorage for user, set isLoading=false after check

2. client/src/api/axiosInstance.js (Axios configured instance):
   - baseURL from import.meta.env.VITE_API_BASE_URL
   - withCredentials: true (send cookies for refresh token)
   - Request interceptor: attach Authorization: Bearer <accessToken> from Zustand store
   - Response interceptor:
     - On 401 error: call POST /auth/refresh to get new access token
     - If refresh succeeds: retry original request with new token
     - If refresh fails: call clearAuth(), redirect to /login
     - Use a flag (isRefreshing) to queue multiple 401 requests during refresh
   - Export this instance as 'api'

3. client/src/api/authApi.js:
   - register(data) â†’ POST /auth/register
   - login(data) â†’ POST /auth/login
   - logout() â†’ POST /auth/logout
   - forgotPassword(email) â†’ POST /auth/forgot-password
   - resetPassword(data) â†’ POST /auth/reset-password
   - verifyEmail(token) â†’ GET /auth/verify-email/:token
   - getMe() â†’ GET /auth/me

4. client/src/hooks/useAuth.js (custom hook):
   - Wraps Zustand auth store
   - login(credentials) â€” calls authApi.login, calls setAuth, redirect based on role
     - seeker â†’ /seeker/dashboard
     - employer â†’ /employer/dashboard
     - admin â†’ /admin/dashboard
   - logout() â€” calls authApi.logout, clears store, redirect to /login
   - register(data) â€” calls authApi.register, returns response (user verifies email separately)
   - Returns: { user, isAuthenticated, isLoading, login, logout, register }

5. client/src/components/layout/ProtectedRoute.jsx:
   - Accepts: allowedRoles (array), redirectTo ('/login' default)
   - If isLoading: show full-page spinner
   - If !isAuthenticated: <Navigate to="/login" state={{ from: location }} />
   - If user.role not in allowedRoles: <Navigate to="/unauthorized" />
   - Otherwise: render <Outlet />

6. client/src/pages/auth/RegisterPage.jsx:
   - Step 1: Role selection â€” two large cards "I'm a Job Seeker" / "I'm an Employer"
     with icons, descriptions, select/deselect on click
   - Step 2: Registration form (shown after role selected)
     Common fields: Full Name, Email, Password, Confirm Password
     Employer-only fields: Company Name, Company Website (optional)
   - Password strength indicator (weak/fair/strong/very strong) with color bar
   - Validation with React Hook Form + Yup schema
   - On success: show "Check your email" confirmation screen (not redirect to login yet)
   - Show inline field errors; disable submit button while loading
   - Link to /login at bottom

7. client/src/pages/auth/LoginPage.jsx:
   - Email + Password fields
   - Show/Hide password toggle button
   - "Remember me" checkbox
   - "Forgot Password?" link â†’ /forgot-password
   - Submit button with loading spinner
   - Social login buttons (Google, LinkedIn) â€” disabled/placeholder for now
   - Error toast on failed login (react-hot-toast)
   - Redirect to original page after login (use location.state.from)
   - Link to /register

8. client/src/pages/auth/ForgotPasswordPage.jsx:
   - Step 1: Email input form â†’ submit â†’ shows "OTP sent" message
   - Step 2: OTP input (6-box digit input, auto-focus next box on input) + New Password + Confirm Password
   - Resend OTP link (cooldown 60 seconds with countdown timer)
   - On success: redirect to /login with success toast

9. client/src/pages/auth/VerifyEmailPage.jsx:
   - Extract token from URL params
   - On mount: call verifyEmail(token)
   - Loading state: spinner with "Verifying your email..."
   - Success state: checkmark icon + "Email verified! You can now log in." + button to /login
   - Error state: X icon + error message + "Resend verification email" button

10. client/src/App.jsx â€” Router setup:
    - Public routes (no auth needed):
      /, /jobs, /jobs/:slug, /companies/:slug, /about, /contact
    - Auth routes (redirect to dashboard if already logged in):
      /login, /register, /forgot-password, /verify-email
    - Seeker routes (ProtectedRoute allowedRoles=['seeker']):
      /seeker/dashboard, /seeker/profile, /seeker/resume, /seeker/applications,
      /seeker/saved-jobs, /seeker/alerts
    - Employer routes (ProtectedRoute allowedRoles=['employer']):
      /employer/dashboard, /employer/jobs, /employer/jobs/new,
      /employer/jobs/:id/edit, /employer/jobs/:id/applicants,
      /employer/company, /employer/analytics, /employer/billing
    - Admin routes (ProtectedRoute allowedRoles=['admin','super_admin']):
      /admin/dashboard, /admin/users, /admin/jobs, /admin/analytics
    - /unauthorized â€” 403 page
    - * â€” 404 page

Show complete code for all files. Use Tailwind CSS for all styling.
No external UI component libraries â€” build components from scratch with Tailwind.
```

---

## Expected Output Files

```
client/src/
â”œâ”€â”€ store/authStore.js
â”œâ”€â”€ api/
â”‚   â”œâ”€â”€ axiosInstance.js
â”‚   â””â”€â”€ authApi.js
â”œâ”€â”€ hooks/useAuth.js
â”œâ”€â”€ components/
â”‚   â””â”€â”€ layout/ProtectedRoute.jsx
â”œâ”€â”€ pages/auth/
â”‚   â”œâ”€â”€ RegisterPage.jsx
â”‚   â”œâ”€â”€ LoginPage.jsx
â”‚   â”œâ”€â”€ ForgotPasswordPage.jsx
â”‚   â””â”€â”€ VerifyEmailPage.jsx
â””â”€â”€ App.jsx
```

---

## Key Concepts to Learn

- **Zustand** â€” lightweight state management; no Provider needed; access store anywhere with `useStore()`
- **Axios interceptors** â€” `axios.interceptors.request.use()` runs before every request; `response.use(onSuccess, onError)` intercepts errors
- **Token refresh race condition** â€” if 3 requests fail with 401 simultaneously, only one should call refresh; others should queue and retry after. The `isRefreshing` flag solves this
- **React Router v6 protected routes** â€” use `<Outlet />` pattern with wrapper components instead of v5's render props
- **React Hook Form** â€” `useForm()`, `register()`, `handleSubmit()`, `formState.errors`; uncontrolled by default (better performance)
- **Yup validation** â€” `yup.object().shape({})` defines schema; use `resolver: yupResolver(schema)` in `useForm`

---

## Component Design Notes

### OTP Input (6 boxes)
```jsx
// Each box is an <input maxLength={1} />
// On input: move focus to next input
// On backspace: move focus to previous input
// Combine all values for the OTP string
```

### Password Strength Indicator
```jsx
const getStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return ['', 'weak', 'fair', 'strong', 'very strong'][score];
};
```

---

## Validation Checklist

- [ ] Register as seeker â†’ redirected to "check email" page
- [ ] Register as employer â†’ company name field appears
- [ ] Login â†’ redirected to correct dashboard based on role
- [ ] Invalid credentials â†’ error message displayed
- [ ] Accessing `/seeker/dashboard` without login â†’ redirected to `/login`
- [ ] After login, accessing `/login` â†’ redirected to dashboard
- [ ] Employer accessing `/seeker/dashboard` â†’ redirected to `/unauthorized`
- [ ] Token auto-refresh works when access token expires
- [ ] Logout clears all state and cookies

---

## Next Step
Move to **Prompt 06 â€” Seeker Profile Backend** once login/register flows work end-to-end.

