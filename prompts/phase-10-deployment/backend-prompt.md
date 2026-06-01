# Prompt 24 â€” Deployment

## Phase
Phase 10 â€” Final Integration & Deployment

## Objective
Deploy the React frontend to Vercel, Node.js backend to Railway/Render, set up PostgreSQL in production, configure CI/CD with GitHub Actions, and add PM2 process management.

---

## Prompt to Use

```
Set up production deployment for the Job Portal.

FRONTEND DEPLOYMENT (Vercel):

1. client/vercel.json:
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
     "headers": [
       {
         "source": "/assets/(.*)",
         "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
       }
     ]
   }
   
   Note: rewrites needed for React Router â€” all routes serve index.html

2. client/vite.config.js â€” production optimizations:
   build: {
     rollupOptions: {
       output: {
         manualChunks: {
           vendor: ['react', 'react-dom', 'react-router-dom'],
           ui: ['recharts', '@dnd-kit/core'],
           query: ['@tanstack/react-query'],
         }
       }
     },
     chunkSizeWarningLimit: 1000,
   }

3. Vercel environment variables (set in Vercel dashboard):
   VITE_API_BASE_URL=https://your-api.railway.app/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   VITE_SOCKET_URL=https://your-api.railway.app

BACKEND DEPLOYMENT (Railway):

4. server/Procfile:
   web: node server.js

5. server/ecosystem.config.cjs (PM2 for Railway/VPS):
   module.exports = {
     apps: [{
       name: 'jobportal-api',
       script: 'server.js',
       instances: 'max',       // use all CPU cores
       exec_mode: 'cluster',   // cluster mode for Node.js
       watch: false,
       env_production: {
         NODE_ENV: 'production',
       },
       error_file: 'logs/pm2-error.log',
       out_file: 'logs/pm2-out.log',
       log_date_format: 'YYYY-MM-DD HH:mm:ss',
       max_memory_restart: '512M',
     }]
   }

6. server/src/app.js â€” production additions:
   - Trust proxy (for Railway/Nginx): app.set('trust proxy', 1)
   - This is needed for correct IP detection behind load balancer
   - Required for rate limiting to work correctly in production

7. server/.env.production template:
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=postgresql://... (Railway PostgreSQL URL)
   JWT_SECRET=<64 char random string>
   JWT_REFRESH_SECRET=<64 char random string>
   CLIENT_URL=https://your-app.vercel.app
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   OPENAI_API_KEY=sk-...
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASS=<sendgrid api key>
   REDIS_URL=redis://... (optional, for caching)

DATABASE (Railway PostgreSQL):

8. server/src/database/migrations/run-migrations.js:
   - Script to run all pending migrations on deploy
   - Called in Railway start command: npm run migrate && node server.js

9. server/package.json â€” add start script:
   "scripts": {
     "start": "node server.js",
     "start:prod": "npm run migrate && node server.js",
     "migrate": "sequelize-cli db:migrate",
     "pm2:start": "pm2 start ecosystem.config.cjs --env production",
     "pm2:restart": "pm2 restart jobportal-api",
     "pm2:logs": "pm2 logs jobportal-api"
   }

CI/CD (GitHub Actions):

10. .github/workflows/ci.yml:
    name: CI Pipeline
    on:
      push:
        branches: [main, develop]
      pull_request:
        branches: [main]

    jobs:
      test-backend:
        runs-on: ubuntu-latest
        services:
          postgres:
            image: postgres:15
            env:
              POSTGRES_DB: jobportal_test
              POSTGRES_USER: postgres
              POSTGRES_PASSWORD: postgres
            ports: ['5432:5432']
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-node@v4
            with: { node-version: '20' }
          - run: cd server && npm ci
          - run: cd server && npm run audit:ci
          - run: cd server && npm test -- --coverage
            env:
              TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/jobportal_test
              JWT_SECRET: test-secret-min-32-chars-long
              JWT_REFRESH_SECRET: test-refresh-secret-min-32-chars

      test-frontend:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-node@v4
            with: { node-version: '20' }
          - run: cd client && npm ci
          - run: cd client && npm test -- --coverage
          - run: cd client && npm run build

      deploy-backend:
        needs: [test-backend, test-frontend]
        runs-on: ubuntu-latest
        if: github.ref == 'refs/heads/main'
        steps:
          - uses: actions/checkout@v4
          - uses: railwayapp/deploy@v1
            with:
              service: jobportal-api
              token: ${{ secrets.RAILWAY_TOKEN }}

      deploy-frontend:
        needs: [test-backend, test-frontend]
        runs-on: ubuntu-latest
        if: github.ref == 'refs/heads/main'
        steps:
          - uses: actions/checkout@v4
          - uses: amondnet/vercel-action@v25
            with:
              vercel-token: ${{ secrets.VERCEL_TOKEN }}
              vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
              vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
              vercel-args: '--prod'

11. Health check endpoint â€” ALREADY BUILT in Prompt 02.
    Railway/Render needs: GET /health returning 200.
    Add to Railway start settings: Health check path = /health

Show all config files completely.
```

---

## Deployment Checklist

### Before Deploying
- [ ] All tests pass in CI
- [ ] `npm audit` shows no critical vulnerabilities
- [ ] All environment variables documented in .env.example
- [ ] `npm run build` succeeds locally
- [ ] Database migrations are reversible

### After Deploying
- [ ] `GET https://your-api.railway.app/health` returns 200
- [ ] `GET https://your-app.vercel.app` loads correctly
- [ ] Login flow works end-to-end on production
- [ ] Stripe webhook endpoint is registered at `https://api/payments/webhook`
- [ ] SSL certificate is active (Railway/Vercel provide this automatically)

---

## Production Environment Setup Order

```
1. Create Railway account â†’ provision PostgreSQL
2. Copy DATABASE_URL from Railway dashboard
3. Set all env vars in Railway
4. Deploy backend â†’ verify /health works
5. Create Vercel account â†’ import GitHub repo (client/)
6. Set VITE_API_BASE_URL to Railway URL
7. Deploy frontend
8. Register Stripe webhook in Stripe dashboard
9. Test end-to-end: register â†’ post job â†’ apply â†’ pay
```

---

## Key Concepts to Learn

- **PM2 cluster mode** â€” runs one Node.js process per CPU core; multiplies throughput; `exec_mode: 'cluster'` handles load balancing
- **Railway** â€” PaaS that auto-detects Node.js; auto-deploys from GitHub; provides managed PostgreSQL
- **`trust proxy`** â€” must be set when behind a reverse proxy (Nginx/Railway); allows correct IP detection for rate limiting
- **Manual chunks (Vite)** â€” split large dependencies into separate chunks; allows browser caching of vendor code independently of your app code
- **GitHub Actions services** â€” `services:` spins up Docker containers (like PostgreSQL) for the duration of the CI job

---

## Next Step
**Prompt 25 â€” Performance Optimization** (Final step!)


# Prompt 22 â€” Security Hardening

## Phase
Phase 10 â€” Final Integration & Deployment

## Objective
Apply comprehensive security hardening to the Node.js backend including headers, rate limiting, input sanitization, CSRF protection, and vulnerability scanning.

---

## Prompt to Use

```
Apply complete security hardening to the Job Portal Node.js/Express backend.

1. Install security packages:
   npm install helmet express-rate-limit express-validator xss hpp csurf
   npm install --save-dev audit-ci

2. server/src/app.js â€” complete security middleware setup in ORDER:

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
   - Progressive delays: attempt 3 â†’ wait 5s; attempt 4 â†’ 15s; attempt 5+ â†’ lock 15min
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
   - Generate UUID filename (already done â€” verify)
   - Scan filename for path traversal: reject if contains ../ or absolute paths
   - Add virus scanning stub (log warning that ClamAV integration needed in production)

8. package.json â€” add security scripts:
   "scripts": {
     "audit": "npm audit",
     "audit:fix": "npm audit fix",
     "audit:ci": "audit-ci --moderate"
   }
   
   Add to CI/CD: run npm audit on every push; fail on high/critical vulnerabilities

9. Environment variable validation â€” add to env.js:
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

- [ ] A01 Broken Access Control â€” RLS + ownership checks on every route
- [ ] A02 Cryptographic Failures â€” bcrypt passwords, TLS in transit, UUID filenames
- [ ] A03 Injection â€” parameterized queries, express-validator, no raw SQL concatenation
- [ ] A04 Insecure Design â€” rate limiting, account lockout, quota enforcement
- [ ] A05 Security Misconfiguration â€” helmet headers, CORS whitelist, no debug in prod
- [ ] A06 Vulnerable Components â€” `npm audit` in CI
- [ ] A07 Auth Failures â€” lockout, MFA support, refresh token rotation
- [ ] A08 Data Integrity â€” webhook signature verification, CSRF tokens
- [ ] A09 Logging Failures â€” Winston + Morgan, PII masked in logs
- [ ] A10 SSRF â€” no server-side URL fetching of user input

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
**Prompt 23 â€” Testing**

