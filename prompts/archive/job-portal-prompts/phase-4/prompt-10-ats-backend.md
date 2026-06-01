# Prompt 10 — ATS (Applicant Tracking System) Backend

## Phase
Phase 4 — Employer Module

## Objective
Build the Applicant Tracking System with stage management, internal notes, ratings, email templates, interview scheduling, and analytics.

---

## Prompt to Use

```
Build the Applicant Tracking System (ATS) APIs for employers in Node.js/Express.

1. server/src/services/atsService.js:

   getApplicants(userId, jobId, filters):
   - Verify employer owns the job
   - filters: { ats_stage, search (name/email), rating, page, limit }
   - Include: SeekerProfile → User (name, email, avatar),
     Resume (file_name, storage_path), WorkExperience (latest 1)
   - Order: by created_at DESC (default), or by rating DESC
   - Return paginated applicant list with seeker details

   getApplicantDetail(userId, applicationId):
   - Verify employer owns the job this application belongs to
   - Full seeker profile: personal info, all experience, all education, all skills
   - Application: stage, rating, notes, cover letter, resume
   - Application history: stage change timeline
   - Return comprehensive applicant view

   updateStage(userId, applicationId, newStage, notifySeeker, rejectionReason):
   - Verify ownership
   - Valid stages: applied→reviewing→shortlisted→interview→offer→hired/rejected
   - Allow going backwards (interviewer may revert to shortlisted)
   - Create ApplicationHistory record: { application_id, from_stage, to_stage, changed_by, note }
   - If notifySeeker=true (default): create Notification for seeker + send email
   - Email template varies by stage:
     reviewing: "Your application is being reviewed"
     shortlisted: "Great news! You've been shortlisted"
     interview: "You've been invited for an interview"
     offer: "Congratulations! You have a job offer"
     hired: "Welcome aboard!"
     rejected: "Thank you for applying..." (with optional rejectionReason)
   - Update ats_stage in Application
   - Return updated application

   addNote(userId, applicationId, noteText, isPrivate):
   - Create ApplicationNote: { application_id, author_id, note, is_private, created_at }
   - Private notes: only visible to employer team
   - Return created note

   getNotes(userId, applicationId) — return all notes for application

   setRating(userId, applicationId, rating):
   - Validate 1-5
   - Update Application.employer_rating
   - Return updated application

   scheduleInterview(userId, applicationId, data):
   - data: { scheduled_at, duration_minutes, type (video/phone/onsite), location?, notes?, interviewer_ids? }
   - Create InterviewSchedule record
   - Send calendar invite email to seeker with interview details
   - Create Notification for seeker
   - Return created schedule

   emailApplicant(userId, applicationId, { subject, body, templateId? }):
   - Verify ownership
   - Send email to seeker using Nodemailer
   - Log sent email in ApplicationEmail table
   - Return success

   exportApplicants(userId, jobId, format):
   - format: 'csv' or 'json'
   - Build data array: name, email, phone, stage, rating, applied_at, headline, experience_years
   - For CSV: use csv-stringify library
   - Set response headers for file download
   - Stream response

2. server/src/routes/employer.js — ATS routes:
   GET    /jobs/:jobId/applicants              → getApplicants
   GET    /applicants/:id                      → getApplicantDetail
   PUT    /applicants/:id/stage               → updateStage
   POST   /applicants/:id/notes               → addNote
   GET    /applicants/:id/notes               → getNotes
   PUT    /applicants/:id/rating              → setRating
   POST   /applicants/:id/interview           → scheduleInterview
   POST   /applicants/:id/email               → emailApplicant
   GET    /jobs/:jobId/applicants/export      → exportApplicants

3. ADD MODELS:
   ApplicationHistory: id, application_id FK, from_stage, to_stage, changed_by_id FK, note, created_at
   ApplicationNote: id, application_id FK, author_id FK, note TEXT, is_private BOOLEAN, created_at
   InterviewSchedule: id, application_id FK, scheduled_at DATE, duration_minutes, type ENUM(video,phone,onsite), location, notes, created_at
   ApplicationEmail: id, application_id FK, sent_by_id FK, subject, body, sent_at

4. server/src/services/employerAnalyticsService.js:
   getOverview(userId):
   - Active jobs count
   - Total applications this month
   - Shortlisted this month
   - Hired this month
   - Average time to hire (days from applied to hired)
   - Top performing jobs by applications

   getJobAnalytics(userId, jobId):
   - Daily views chart (last 30 days)
   - Daily applications chart (last 30 days)
   - Application funnel: counts per stage
   - Conversion rate: applications/views
   - Top sources (if source tracking implemented)

Routes:
   GET /analytics/overview → getOverview
   GET /analytics/jobs/:id → getJobAnalytics
```

---

## Key Concepts to Learn

- **Application state machine** — define valid transitions; log every change in `ApplicationHistory` for audit trail
- **CSV streaming** — stream large CSV exports instead of buffering in memory; use `res.setHeader('Content-Disposition', 'attachment; filename=applicants.csv')`
- **Notification + email pattern** — always create DB notification AND send email as separate concerns; if email fails, DB notification still exists
- **Stage history** — store every stage change with timestamp; enables "time in stage" analytics and seeker-facing timeline display
- **Bulk operations** — export must handle 1000+ applicants efficiently; use Sequelize streaming or raw queries with pagination

---

## Validation Checklist

- [ ] Stage update creates ApplicationHistory record
- [ ] Stage change sends notification to seeker (check Notification table)
- [ ] Rejected with reason sends email with reason included
- [ ] Notes marked private don't appear in seeker's view
- [ ] Interview schedule creates email to seeker
- [ ] CSV export downloads file with correct data
- [ ] Analytics overview returns accurate counts

---

## Next Step
**Prompt 11 — Employer Frontend**
