# Prompt 02 — Database Setup & Connection

## Phase
Phase 1 — Foundation

## Objective
Set up PostgreSQL database, configure Sequelize ORM with connection pooling, create a health check endpoint, and establish the migration system.

---

## Prompt to Use

```
Set up PostgreSQL database for the Job Portal Node.js backend:

1. DATABASE CONNECTION (server/src/config/database.js):
   - Use Sequelize ORM with pg and pg-hstore
   - Configure connection pool: max 10, min 2, idle 10000ms, acquire 30000ms
   - Read DATABASE_URL from environment variable
   - Enable SSL in production (NODE_ENV=production)
   - Export sequelize instance
   - Log connection success/failure with Winston logger

2. ENVIRONMENT CONFIG (server/src/config/env.js):
   - Use dotenv to load .env file
   - Validate all required env variables exist on startup
   - If any required variable missing, log error and exit process
   - Required vars: PORT, DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, CLIENT_URL
   - Export typed config object

3. DATABASE SYNC (server/server.js):
   - On server start, call sequelize.authenticate() to verify connection
   - In development: use sequelize.sync({ alter: true }) — updates tables to match models
   - In production: only authenticate, never sync (use migrations instead)
   - Log database connection status

4. HEALTH CHECK ENDPOINT (server/src/routes/health.js):
   - GET /health — returns server status, uptime, environment, database status
   - Query database with SELECT 1 to confirm DB is reachable
   - Response format:
     {
       "status": "ok",
       "uptime": 123.45,
       "environment": "development",
       "database": "connected",
       "timestamp": "2024-01-01T00:00:00.000Z"
     }

5. LOGGER (server/src/utils/logger.js):
   - Use Winston with two transports:
     - Console: colorized, format: [LEVEL] message
     - File: logs/app.log (JSON format, all levels)
     - File: logs/error.log (error level only)
   - Export logger with info, warn, error, debug methods

6. MIGRATIONS SETUP:
   - Install sequelize-cli as devDependency
   - Create .sequelizerc file pointing to correct folders
   - Create first migration: 001-create-users-table.js
     - id: UUID, primaryKey, defaultValue UUIDV4
     - email: STRING(320), unique, not null
     - password_hash: STRING, allowNull (null for OAuth users)
     - role: ENUM('seeker','employer','admin','super_admin'), not null
     - full_name: STRING(255), not null
     - avatar_url: TEXT, null
     - phone: STRING(20), null
     - is_verified: BOOLEAN, default false
     - is_active: BOOLEAN, default true
     - mfa_enabled: BOOLEAN, default false
     - last_login_at: DATE, null
     - login_count: INTEGER, default 0
     - created_at, updated_at: DATE

Show complete code for all files above. Also show how to run migrations with npm scripts.
```

---

## Expected Output Files

| File | Purpose |
|------|---------|
| `server/src/config/database.js` | Sequelize instance with pooling |
| `server/src/config/env.js` | Validated environment config |
| `server/src/utils/logger.js` | Winston logger |
| `server/src/routes/health.js` | Health check route |
| `server/.sequelizerc` | Sequelize CLI config |
| `server/src/database/migrations/001-create-users-table.js` | First migration |

---

## Key Concepts to Learn

- **Connection Pooling** — why `max: 10` matters; avoids creating a new DB connection per request
- **Sequelize authenticate() vs sync()** — `authenticate()` just tests the connection; `sync()` creates/alters tables; never use `sync` in production
- **Migrations vs sync** — migrations give you version-controlled schema changes; sync is for development convenience only
- **Environment validation** — fail fast on startup if config is missing; better than cryptic errors at runtime
- **Winston transports** — sending logs to multiple destinations simultaneously

---

## npm Scripts to Add (server/package.json)

```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "db:migrate": "sequelize-cli db:migrate",
    "db:migrate:undo": "sequelize-cli db:migrate:undo",
    "db:seed": "sequelize-cli db:seed:all",
    "db:reset": "sequelize-cli db:migrate:undo:all && sequelize-cli db:migrate && sequelize-cli db:seed:all"
  }
}
```

---

## PostgreSQL Setup Commands

```bash
# Install PostgreSQL (Ubuntu/Mac)
# Mac: brew install postgresql@15
# Ubuntu: sudo apt install postgresql

# Create database
createdb jobportal_dev
createdb jobportal_test

# Verify connection
psql jobportal_dev -c "SELECT version();"
```

---

## Validation Checklist

- [ ] `npm run dev` starts without errors
- [ ] Console shows "Database connected successfully"
- [ ] `GET http://localhost:5000/health` returns `{ status: "ok", database: "connected" }`
- [ ] `logs/app.log` file is created with log entries
- [ ] `npm run db:migrate` creates users table in PostgreSQL
- [ ] Server exits with error message if DATABASE_URL is missing from .env

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `ECONNREFUSED 5432` | PostgreSQL not running. Start with `brew services start postgresql` |
| `role "user" does not exist` | Create PostgreSQL user or use correct credentials in DATABASE_URL |
| `SSL required` | Add `?sslmode=disable` to DATABASE_URL in local development |
| `sequelize-cli not found` | Run `npm install --save-dev sequelize-cli` |

---

## Next Step
Move to **Prompt 03 — Database Schema & Models** once database connects successfully.
