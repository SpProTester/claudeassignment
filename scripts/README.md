# Scripts

> Developer automation and operations utility scripts.

---

## Folder Structure

```
scripts/
├── dev-automation/     # Local setup helpers, data generators, dev utilities
└── ops/                # Production operations scripts (DB admin, backups, etc.)
```

---

## Dev Automation Scripts

### `dev-automation/setup.sh`

Full local environment setup (run once after cloning):
```bash
bash scripts/dev-automation/setup.sh
# Creates .env files from examples
# Installs all dependencies
# Creates local databases
# Runs migrations and seeds
```

### `dev-automation/reset-db.sh`

Reset development database to clean seeded state:
```bash
bash scripts/dev-automation/reset-db.sh
# Drops and recreates jobportal_dev
# Runs all migrations
# Runs all seeders
```

### `dev-automation/seed-jobs.js`

Generate bulk fake job listings for development:
```bash
node scripts/dev-automation/seed-jobs.js --count=500 --employer-id=<uuid>
```

### `dev-automation/create-admin.js`

Create an admin user for local testing:
```bash
node scripts/dev-automation/create-admin.js --email=admin@test.com --password=Admin123!
```

---

## Ops Scripts

### `ops/backup-db.sh`

Create a timestamped PostgreSQL backup:
```bash
bash scripts/ops/backup-db.sh
# Output: backups/jobportal_2026-05-30_10-00.sql.gz
```

### `ops/create-stripe-products.js`

Initialize Stripe products and price IDs for all subscription plans:
```bash
node server/src/scripts/create-stripe-products.js
# Creates: Free, Professional, Business, Enterprise products in Stripe
# Outputs price IDs to add to .env
```

### `ops/migrate-prod.sh`

Safe production migration script with pre-flight checks:
```bash
bash scripts/ops/migrate-prod.sh
# 1. Verifies DATABASE_URL is set
# 2. Takes a backup
# 3. Runs pending migrations
# 4. Logs result to migration.log
```

---

## npm Scripts Reference

From project root `package.json`:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "dev:client": "cd client && npm run dev",
    "dev:server": "cd server && npm run dev",
    "build": "cd client && npm run build",
    "test": "cd server && npm test",
    "lint": "eslint . --ext .js,.jsx"
  }
}
```

From `server/package.json`:

```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "test": "jest --runInBand",
    "db:migrate": "sequelize-cli db:migrate",
    "db:migrate:undo": "sequelize-cli db:migrate:undo",
    "db:seed": "sequelize-cli db:seed:all",
    "db:seed:undo": "sequelize-cli db:seed:undo:all",
    "db:reset": "npm run db:migrate:undo:all && npm run db:migrate && npm run db:seed"
  }
}
```
