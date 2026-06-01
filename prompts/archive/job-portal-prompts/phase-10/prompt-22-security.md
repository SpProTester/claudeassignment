# Prompt 22 — Security Hardening

## Phase
Phase 10 — Final Integration & Deployment

## Objective
Apply comprehensive security hardening to the Node.js backend including headers, rate limiting, input sanitization, CSRF protection, and vulnerability scanning.

---

## Prompt to Use

```
Apply complete security hardening to the Job Portal Node.js/Express backend.

1. Install security packages:
   npm install helmet express-rate-limit express-validator xss hpp csurf
   npm install --save-dev audit-ci

2. server/src/app.js — complete security middleware setup in ORDER:

   // 1. Security headers (first middleware)
   app.use(helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
         fontSrc: ["'self'", "https://fonts.gstatic.com"],
         imgSrc: ["'self'", "data:", "https:", "blob:"],
         scriptSrc: ["'self'"],
         connectSrc: ["'self'", process.env.CLIENT_URL],
         objectSrc: ["'none'"],
         upgradeInsecureRequests: [],
       },
     },
     crossOriginEmbedderPolicy: false,
   }))

   // 2. CORS
   app.use(cors({
     origin: process.env.CLIENT_URL,
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
     allowedHeaders: ['Content-Type', 'Authorization'],
   }))

   // 3. Request parsing (before rate limiting)
   app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))
   app.use(express.json({ limit: '10kb' }))  // limit request body size
   app.use(express.urlencoded({ extended: true, limit: '10kb' }))

   // 4. Rate limiting
   const publicLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,  // 15 minutes
     max: 100,
     message: { error: 'Too many requests, please try again later' },
     standardHeaders: true,
     legacyHeaders: false,
   })
   
   const authLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 10,  // stricter for auth routes
     message: { error: 'Too many auth attempts' },
   })
   
   const authenticatedLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 500,
     keyGenerator: (req) => req.user?.id || req.ip,  // per user
   })
   
   app.use('/api/auth', authLimiter)
   app.use('/api', publicLimiter)

   // 5. Prevent parameter pollution
   app.use(hpp())

   // 6. Morgan logging (after security setup)
   app.use(morgan('combined', { 
     stream: { write: msg => logger.info(msg.trim()) },
     skip: (req) => req.url === '/health'
   }))

3. server/src/middleware/sanitize.js:
   - Sanitize all string inputs to prevent XSS
   - Use xss library: xss(input) for rich text fields
   - Use validator.escape() for plain text fields
   - Never use dangerouslySetInnerHTML in frontend without sanitization
   - Middleware that sanitizes req.body strings recursively:
     const sanitizeBody = (req, res, next) => {
       req.body = sanitizeObject(req.body)
       next()
     }
   - Export and apply before route handlers

4. server/src/middleware/rateLimiter.js:
   - Export: publicLimiter, authLimiter, authenticatedLimiter, uploadLimiter
   - uploadLimiter: 5 uploads per hour per user
   - searchLimiter: 200 searches per 15 min

5. Account lockout improvements (update authService.js):
   - Track failed attempts in DB (already done) AND in memory (Map for speed)
   - Progressive delays: attempt 3 → wait 5s; attempt 4 → 15s; attempt 5+ → lock 15min
   - Lock based on email + IP (prevents distributed attacks somewhat)
   - Alert admin if same IP fails 50+ times in 1 hour

6. Input validation hardening (update all validators):
   - Trim all string inputs
   - Reject strings containing null bytes (\x00)
   - Limit array inputs: no more than 50 items
   - Validate UUIDs with proper regex before DB queries
   - Reject payloads with more than 20 keys

7. File upload security (update multer config):
   - Verify file type with file-type library (not just extension)
   - Generate UUID filename (already done — verify)
   - Scan filename for path traversal: reject if contains ../ or absolute paths
   - Add virus scanning stub (log warning that ClamAV integration needed in production)

8. package.json — add security scripts:
   "scripts": {
     "audit": "npm audit",
     "audit:fix": "npm audit fix",
     "audit:ci": "audit-ci --moderate"
   }
   
   Add to CI/CD: run npm audit on every push; fail on high/critical vulnerabilities

9. Environment variable validation — add to env.js:
   - Verify JWT_SECRET length >= 32 chars
   - Verify NODE_ENV is set
   - Warn if using default/example secrets
```

---

## Security Headers Explained

| Header (via Helmet) | What it does |
|---|---|
| `Strict-Transport-Security` | Force HTTPS; prevents protocol downgrade |
| `X-Frame-Options: DENY` | Prevents clickjacking via iframes |
| `X-Content-Type-Options: nosniff` | Prevents MIME type sniffing |
| `Content-Security-Policy` | Whitelist trusted content sources |
| `X-XSS-Protection` | Legacy XSS browser filter (now CSP does this) |
| `Referrer-Policy` | Controls what referrer info is sent |

---

## OWASP Checklist

- [ ] A01 Broken Access Control — RLS + ownership checks on every route
- [ ] A02 Cryptographic Failures — bcrypt passwords, TLS in transit, UUID filenames
- [ ] A03 Injection — parameterized queries, express-validator, no raw SQL concatenation
- [ ] A04 Insecure Design — rate limiting, account lockout, quota enforcement
- [ ] A05 Security Misconfiguration — helmet headers, CORS whitelist, no debug in prod
- [ ] A06 Vulnerable Components — `npm audit` in CI
- [ ] A07 Auth Failures — lockout, MFA support, refresh token rotation
- [ ] A08 Data Integrity — webhook signature verification, CSRF tokens
- [ ] A09 Logging Failures — Winston + Morgan, PII masked in logs
- [ ] A10 SSRF — no server-side URL fetching of user input

---

## Validation Checklist

- [ ] `curl -I http://localhost:5000/api/jobs` shows security headers in response
- [ ] 11th auth request in 15 min window returns 429
- [ ] POST body with >10KB returns 413 (payload too large)
- [ ] SQL injection attempt `'; DROP TABLE users; --` in search doesn't affect DB
- [ ] XSS attempt `<script>alert(1)</script>` in job description is escaped
- [ ] `npm run audit:ci` passes without critical vulnerabilities

---

## Next Step
**Prompt 23 — Testing**
