# Authentication — Backend Flow

---

## Request Lifecycle

### Registration

```
POST /api/auth/register
  │
  ├─ [Middleware] express-validator → validate body
  ├─ [Middleware] validate.middleware.js → collect errors, return 400 if any
  │
  ├─ authController.register(req, res, next)
  │     └─ authService.register({ email, password, role, full_name, company_name })
  │           ├─ Check: User.findOne({ where: { email } }) → 409 if exists
  │           ├─ hash = await bcrypt.hash(password, 12)
  │           ├─ token = crypto.randomBytes(32).toString('hex')
  │           ├─ tokenHash = sha256(token)
  │           ├─ Transaction:
  │           │   ├─ User.create({ email, password_hash: hash, role, full_name,
  │           │   │               email_verify_token: tokenHash,
  │           │   │               email_verify_expires: now + 24h })
  │           │   └─ SeekerProfile.create / EmployerProfile.create (based on role)
  │           └─ sendVerificationEmail(email, name, token) [async, non-blocking]
  │
  └─ Response 201: { success, message, data: { user } }
```

### Login

```
POST /api/auth/login
  │
  ├─ [Middleware] loginRules validator
  │
  ├─ authController.login(req, res, next)
  │     └─ authService.login({ email, password })
  │           ├─ user = User.findOne({ where: { email } }) → 401 if null
  │           ├─ Check is_active → 403 if false
  │           ├─ Check lockout_until → 423 if still locked
  │           ├─ bcrypt.compare(password, user.password_hash)
  │           │   ├─ FAIL: increment failed_login_attempts
  │           │   │         if attempts >= 5: set lockout_until = now + 15min
  │           │   │         return 401
  │           │   └─ PASS: reset failed_login_attempts = 0
  │           │            update last_login_at, login_count
  │           ├─ accessToken = generateAccessToken({ userId, email, role })
  │           ├─ refreshToken = generateRefreshToken({ userId })
  │           ├─ RefreshToken.create({ user_id, token_hash: sha256(refreshToken),
  │           │                       expires_at: now + 30d })
  │           └─ return { user, accessToken, refreshToken }
  │
  ├─ Set cookie: res.cookie('refreshToken', token, { httpOnly, sameSite:'strict', maxAge })
  └─ Response 200: { success, data: { accessToken, user } }
```

### Protected Route Request

```
GET /api/seeker/profile  (example protected endpoint)
  │
  ├─ auth.middleware.js → authenticateToken(req, res, next)
  │     ├─ Extract: req.headers.authorization.split(' ')[1]
  │     ├─ verifyAccessToken(token) → decoded { userId, email, role }
  │     ├─ req.user = decoded
  │     └─ next()
  │
  ├─ authorizeRole('seeker')(req, res, next)
  │     ├─ Check req.user.role === 'seeker'
  │     └─ next() or 403
  │
  └─ seekerController.getProfile(req, res)
```

### Token Refresh

```
POST /api/auth/refresh
  │
  ├─ Read: req.cookies.refreshToken
  ├─ verifyRefreshToken(token) → decoded { userId }
  ├─ dbToken = RefreshToken.findOne({ where: { token_hash: sha256(token), is_revoked: false } })
  │   └─ 401 if not found or expired
  ├─ Mark old token: dbToken.update({ is_revoked: true })
  ├─ Generate new accessToken + refreshToken
  ├─ RefreshToken.create(new token hash)
  ├─ Set new cookie
  └─ Response 200: { accessToken }
```

---

## Middleware Chain

```
Request
  │
  ├─ cors()                   — Allow CORS from CLIENT_URL
  ├─ helmet()                 — Security headers
  ├─ morgan()                 — HTTP access log
  ├─ express.json()           — Parse JSON body
  ├─ rateLimiter()            — 10 req/min per IP on auth routes
  │
  ├─ router.post('/register') ─→ [registerRules] → [validate] → controller
  ├─ router.post('/login')    ─→ [loginRules] → [validate] → controller
  ├─ router.post('/refresh')  ─→ controller
  ├─ router.post('/logout')   ─→ [authenticateToken] → controller
  └─ router.get('/me')        ─→ [authenticateToken] → controller
  │
  └─ errorHandler()           — Global error catch (4-param Express middleware)
```

---

## Service Layer Structure

```
server/src/services/authService.js

exports:
  register(data)        → { user, message }
  login(data)           → { user, accessToken, refreshToken }
  refreshTokens(token)  → { accessToken, refreshToken }
  logout(token)         → void
  verifyEmail(token)    → { message }
  forgotPassword(email) → { message }
  resetPassword(email, otp, newPassword) → { message }
```

No `req`/`res` in the service layer — purely business logic.

---

## Error Handling

| Scenario | Error Class | HTTP Status |
|----------|-------------|-------------|
| Validation failure | `ValidationError` (Sequelize) | 400 |
| Duplicate email | `UniqueConstraintError` (Sequelize) | 409 |
| Wrong credentials | `AppError('INVALID_CREDENTIALS', 401)` | 401 |
| Account locked | `AppError('ACCOUNT_LOCKED', 423)` | 423 |
| JWT expired | `JsonWebTokenError` | 401 |
| Insufficient role | `AppError('FORBIDDEN', 403)` | 403 |
| Unhandled exception | Express error handler | 500 |

### AppError Class
```javascript
class AppError extends Error {
  constructor(code, statusCode, message) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
```

---

## JWT Payload Structure

**Access Token** (15 min):
```json
{
  "userId": "uuid",
  "email": "john@example.com",
  "role": "seeker",
  "iat": 1717000000,
  "exp": 1717000900
}
```

**Refresh Token** (30 days):
```json
{
  "userId": "uuid",
  "iat": 1717000000,
  "exp": 1719592000
}
```
