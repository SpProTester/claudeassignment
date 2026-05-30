# Deployment

> Infrastructure, containerization, CI/CD, and production deployment guides.

---

## Folder Structure

```
deployment/
├── docker/         # Dockerfile and docker-compose files
├── k8s/            # Kubernetes manifests (Deployments, Services, Ingress)
├── infra/          # Terraform infrastructure-as-code
└── ci/             # Additional CI/CD configuration
```

---

## Quick Start: Docker Compose (Local)

```bash
# From project root
docker-compose up -d

# Services started:
# → client:  http://localhost:5173
# → server:  http://localhost:5000
# → postgres: localhost:5432
# → redis:   localhost:6379

# Run migrations inside container
docker-compose exec server npm run db:migrate
docker-compose exec server npm run db:seed
```

---

## Environment Overview

| Environment | URL | Database | Notes |
|-------------|-----|----------|-------|
| Development | localhost:5173 | `jobportal_dev` | Hot reload, Stripe test mode |
| Test (CI) | N/A | `jobportal_test` | Ephemeral, reset per test run |
| Staging | staging.jobportal.com | `jobportal_staging` | Mirror of production config |
| Production | jobportal.com | `jobportal_prod` | Full SSL, connection pooling, S3 |

---

## Production Architecture

```
Internet
  │
  ├─ Cloudflare (CDN + DDoS protection)
  │
  ├─ Load Balancer (AWS ALB / Nginx)
  │   ├─ /api/*  → Node.js containers (ECS / Railway)
  │   └─ /*      → React SPA (S3 + CloudFront / Vercel)
  │
  ├─ PostgreSQL (AWS RDS / Neon / Supabase)
  ├─ Redis (AWS ElastiCache / Upstash) — sessions, rate limits, Socket.IO
  └─ S3 / Cloudinary — resume and image storage
```

---

## Docker Files

### `deployment/docker/Dockerfile.server`

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --production
COPY server/src ./src
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "src/index.js"]
```

### `deployment/docker/Dockerfile.client`

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY deployment/docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

---

## CI/CD Pipeline (GitHub Actions)

```
Push to main branch:
  1. Lint (ESLint)
  2. Unit + Integration tests
  3. E2E tests (headless)
  4. Build Docker images
  5. Push to container registry (ECR / GHCR)
  6. Deploy to production (ECS / Railway / Render)
  7. Run smoke tests against production URL
  8. Notify Slack (#deployments)
```

Workflow files: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

---

## Environment Variables for Production

Copy `server/.env.example` to `server/.env` and set all values. Required vars:

```
DATABASE_URL           — PostgreSQL connection string (with SSL)
JWT_SECRET             — 32+ char random string
JWT_REFRESH_SECRET     — 32+ char random string (different from above)
STRIPE_SECRET_KEY      — sk_live_... (live mode key)
STRIPE_WEBHOOK_SECRET  — whsec_... (from Stripe dashboard)
CLIENT_URL             — https://jobportal.com
AWS_ACCESS_KEY_ID      — S3 credentials
AWS_SECRET_ACCESS_KEY  — S3 credentials
AWS_S3_BUCKET          — jobportal-uploads-prod
```

---

## Pre-Deployment Checklist

- [ ] All tests passing in CI
- [ ] Database migrations run on staging, verified
- [ ] Environment variables set in production
- [ ] Stripe webhook URL registered in Stripe Dashboard for production
- [ ] CORS `CLIENT_URL` matches production frontend URL
- [ ] SSL certificate installed (HTTPS)
- [ ] Rate limiting configured for production traffic levels
- [ ] S3 bucket CORS policy configured for frontend domain
- [ ] Socket.IO Redis adapter configured for multi-instance setup
