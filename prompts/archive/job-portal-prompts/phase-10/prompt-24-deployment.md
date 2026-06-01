# Prompt 24 — Deployment

## Phase
Phase 10 — Final Integration & Deployment

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
   
   Note: rewrites needed for React Router — all routes serve index.html

2. client/vite.config.js — production optimizations:
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

6. server/src/app.js — production additions:
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

9. server/package.json — add start script:
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

11. Health check endpoint — ALREADY BUILT in Prompt 02.
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
1. Create Railway account → provision PostgreSQL
2. Copy DATABASE_URL from Railway dashboard
3. Set all env vars in Railway
4. Deploy backend → verify /health works
5. Create Vercel account → import GitHub repo (client/)
6. Set VITE_API_BASE_URL to Railway URL
7. Deploy frontend
8. Register Stripe webhook in Stripe dashboard
9. Test end-to-end: register → post job → apply → pay
```

---

## Key Concepts to Learn

- **PM2 cluster mode** — runs one Node.js process per CPU core; multiplies throughput; `exec_mode: 'cluster'` handles load balancing
- **Railway** — PaaS that auto-detects Node.js; auto-deploys from GitHub; provides managed PostgreSQL
- **`trust proxy`** — must be set when behind a reverse proxy (Nginx/Railway); allows correct IP detection for rate limiting
- **Manual chunks (Vite)** — split large dependencies into separate chunks; allows browser caching of vendor code independently of your app code
- **GitHub Actions services** — `services:` spins up Docker containers (like PostgreSQL) for the duration of the CI job

---

## Next Step
**Prompt 25 — Performance Optimization** (Final step!)
