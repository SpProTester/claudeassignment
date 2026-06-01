# Prompt 15 — Job Alerts System

## Phase
Phase 6 — Notifications & Alerts

## Objective
Build saved job searches (alerts) that email matching jobs to seekers on a daily or weekly schedule.

---

## Prompt to Use

```
Build the job alerts (saved search) system for the Job Portal.

BACKEND:

1. server/src/services/alertService.js:

   createAlert(userId, { name, keywords, location, job_type, work_mode, experience_level, salary_min, frequency }):
   - Find seeker profile
   - Max 10 alerts per user
   - Create JobAlert record
   - Immediately run once to show current matches (return count)
   - Return created alert with match_count

   getAlerts(userId) — list with last_sent_at and match_count

   updateAlert(userId, alertId, data) — verify ownership, update fields

   deleteAlert(userId, alertId) — verify ownership, delete

   toggleAlert(userId, alertId) — flip is_active boolean

   findMatchingJobs(alert):
   - Reuse searchService.searchJobs with alert's filter params
   - Only jobs posted AFTER alert.last_sent_at (or last 24h for first run)
   - Return array of matching job objects

   sendAlertDigest(alert, jobs):
   - Build HTML email with list of matching jobs
   - Each job in email: title, company, location, salary, link to job page
   - Include unsubscribe link (token-based) at bottom
   - Send via Nodemailer
   - Update alert.last_sent_at = NOW()

2. server/src/jobs/alertCron.js:
   - Daily: schedule '0 8 * * *' (8 AM every day)
   - Find all active daily alerts
   - For each: findMatchingJobs → if jobs found: sendAlertDigest
   - Weekly: schedule '0 8 * * 1' (8 AM every Monday)
   - Same for weekly alerts
   - Log: total alerts processed, emails sent, errors

3. server/src/routes/seekers.js — ADD alert routes:
   POST   /alerts              → createAlert
   GET    /alerts              → getAlerts
   PUT    /alerts/:id          → updateAlert
   DELETE /alerts/:id          → deleteAlert
   PUT    /alerts/:id/toggle   → toggleAlert

4. Unsubscribe endpoint (public):
   GET /unsubscribe/:token → decode token, set alert is_active=false, show "Unsubscribed" page

FRONTEND:

5. client/src/pages/seeker/AlertsPage.jsx:
   Header: "Job Alerts" + count + "Create Alert" button

   Alert cards:
   - Alert name (editable inline)
   - Summary of filters: "React • Remote • Full-time • $5,000+"
   - Frequency badge: Daily / Weekly
   - Active/Inactive toggle switch
   - Last sent date
   - Edit, Delete buttons

   Create/Edit Alert Modal:
   - Alert Name
   - Keywords input
   - Location
   - Job Type (multi-select checkboxes)
   - Work Mode (multi-select)
   - Experience Level (multi-select)
   - Salary minimum
   - Frequency: Daily / Weekly radio
   - Save button
   - Preview: "We'll send alerts when new jobs match these filters"

6. Alert digest email template (HTML):
   Professional email with:
   - Header: Job Portal logo + "New jobs matching your alert: {name}"
   - Each job card: title, company, location, type badge, salary, "View Job" button
   - Footer: "You're receiving this because you created a job alert. Unsubscribe"
```

---

## Key Concepts to Learn

- **Cron scheduling** — node-cron syntax: `'minute hour day month weekday'`; `'0 8 * * *'` = 8:00 AM every day
- **Email unsubscribe tokens** — generate `crypto.randomBytes(16).toString('hex')` token stored with alert; verify on unsubscribe route; never expose alert ID directly
- **Alert deduplication** — `last_sent_at` prevents sending same jobs twice; only query jobs posted after last send
- **HTML email** — inline CSS required (Gmail strips `<style>` tags); test with Mailtrap in development; use tables for layout

---

## Validation Checklist

- [ ] Create alert, new matching job posted → alert sends email next morning
- [ ] Toggle inactive → cron skips that alert
- [ ] Unsubscribe link in email disables alert
- [ ] Max 10 alerts per user enforced
- [ ] Weekly alerts only send on Mondays

---

## Next Step
**Prompt 16 — Payment & Subscriptions**
