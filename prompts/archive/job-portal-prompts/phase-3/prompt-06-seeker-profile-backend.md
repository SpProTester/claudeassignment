# Prompt 06 — Job Seeker Profile Backend

## Phase
Phase 3 — Job Seeker Module

## Objective
Build all Job Seeker profile management APIs including personal info, work experience, education, skills, and a stats dashboard endpoint.

---

## Prompt to Use

```
Build the Job Seeker profile management APIs in Node.js/Express.

All routes protected by: authenticateToken + authorizeRole('seeker')
Base path: /api/seekers

1. server/src/services/seekerService.js:

   getProfile(userId):
   - Find SeekerProfile by user_id
   - Include: User (safe fields), WorkExperience (ordered by start_date DESC),
     Education (ordered by start_year DESC), Skills (through SeekerSkill),
     Resumes (ordered by created_at DESC)
   - Calculate profile_completion_score:
     headline +10, summary +15, avatar +10, location +5,
     experience_years +5, at least 1 WorkExperience +20,
     at least 1 Education +15, at least 3 Skills +10,
     at least 1 Resume +10
   - Return structured profile object

   updateProfile(userId, data):
   - Allowed fields: headline, summary, current_location, experience_years,
     salary_min, salary_max, notice_period_days, open_to_work,
     profile_visibility, linkedin_url, portfolio_url, github_url
   - Update User.full_name, User.phone if provided
   - Recalculate and save profile_completion_score
   - Return updated profile

   addWorkExperience(userId, data):
   - Validate: if is_current=true, end_date must be null
   - Validate: start_date must be before end_date
   - Create WorkExperience linked to seeker's profile
   - Return created record

   updateWorkExperience(userId, expId, data) — verify ownership first
   deleteWorkExperience(userId, expId) — verify ownership first

   addEducation(userId, data) — same pattern as work experience
   updateEducation(userId, eduId, data)
   deleteEducation(userId, eduId)

   updateSkills(userId, skills):
   - skills is array of { skill_id, proficiency, years_experience }
   - Find or create each Skill
   - Replace all seeker's skills (delete old, insert new)
   - Return updated skills list

   getDashboardStats(userId):
   - Total applications count
   - Applications by stage: { applied, reviewing, shortlisted, interview, offer, hired, rejected }
   - Saved jobs count
   - Profile views count (last 30 days)
   - Resumes count
   - Recent applications (last 5, with job title and company)
   - Profile completion score
   - Return all stats in one response

2. server/src/controllers/seekerController.js:
   - getProfile, updateProfile
   - addWorkExperience, updateWorkExperience, deleteWorkExperience
   - addEducation, updateEducation, deleteEducation
   - updateSkills, getSkills
   - getDashboard

3. server/src/validators/seekerValidators.js:
   - updateProfileRules: headline max 220 chars, linkedin_url valid URL,
     salary_min/max positive integers, experience_years 0-50
   - workExperienceRules: job_title required, company_name required,
     start_date valid date, end_date after start_date if provided
   - educationRules: degree required, institution required, start_year valid year

4. server/src/routes/seekers.js:
   GET    /profile                    → getProfile
   PUT    /profile                    → updateProfileRules, updateProfile
   GET    /dashboard                  → getDashboardStats
   POST   /experience                 → workExperienceRules, addWorkExperience
   PUT    /experience/:id             → workExperienceRules, updateWorkExperience
   DELETE /experience/:id             → deleteWorkExperience
   POST   /education                  → educationRules, addEducation
   PUT    /education/:id              → educationRules, updateEducation
   DELETE /education/:id              → deleteEducation
   GET    /skills                     → getSkills
   PUT    /skills                     → updateSkills

Standard response format:
{ success: true, data: { ... } }
{ success: false, error: { code, message, field? } }
```

---

## Key Concepts to Learn

- **Ownership verification** — always check `WHERE id = :expId AND seeker_id = :seekerId` before update/delete; prevents IDOR (Insecure Direct Object Reference) attacks
- **Calculated fields** — `profile_completion_score` is computed from related data; consider caching or computing on read vs write
- **Eager loading (include)** — Sequelize's `include` option for related models; equivalent to SQL JOINs; be specific about attributes to avoid over-fetching
- **Bulk replace pattern** — for skills, it's cleaner to delete all and re-insert than to diff; use transactions for atomicity

---

## Validation Checklist

- [ ] `GET /api/seekers/profile` returns full profile with nested experience, education, skills
- [ ] `PUT /api/seekers/profile` updates fields and recalculates completion score
- [ ] Adding work experience with `is_current=true` and an `end_date` returns validation error
- [ ] Updating another seeker's experience returns 403
- [ ] `GET /api/seekers/dashboard` returns all stats in one call
- [ ] Skills update replaces all previous skills

---

## Next Step
**Prompt 07 — Resume Upload Backend**
