# Prompt 03 â€” Database Schema & Sequelize Models

## Phase
Phase 1 â€” Foundation

## Objective
Create all Sequelize models with proper data types, validations, associations, indexes, and hooks for the complete Job Portal database schema.

---

## Prompt to Use

```
Create all Sequelize models for the Job Portal. Each model should be in its own file in server/src/models/. Create an index.js that imports all models, defines associations, and exports them.

MODELS TO CREATE:

1. User (server/src/models/User.js)
   Fields: id(UUID PK), email(STRING 320, unique), password_hash(STRING, null), 
   role(ENUM: seeker,employer,admin,super_admin), full_name(STRING 255), 
   avatar_url(TEXT null), phone(STRING 20 null), is_verified(BOOLEAN false), 
   is_active(BOOLEAN true), mfa_enabled(BOOLEAN false), mfa_secret(STRING null),
   failed_login_attempts(INTEGER 0), locked_until(DATE null),
   last_login_at(DATE null), login_count(INTEGER 0)
   Hooks: beforeCreate â€” hash password with bcrypt(12) if password provided
   Instance method: validatePassword(plainText) â€” bcrypt.compare
   Instance method: toSafeJSON() â€” return user without password_hash, mfa_secret

2. SeekerProfile (server/src/models/SeekerProfile.js)
   Fields: id(UUID PK), user_id(UUID FKâ†’User), headline(STRING 220 null),
   summary(TEXT null), current_location(STRING 255 null),
   experience_years(SMALLINT null), salary_min(INTEGER null), salary_max(INTEGER null),
   notice_period_days(INTEGER 30), open_to_work(BOOLEAN true),
   profile_visibility(ENUM: public,employers_only,private â€” default public),
   linkedin_url(TEXT null), portfolio_url(TEXT null),
   github_url(TEXT null), profile_completion_score(INTEGER 0)

3. EmployerProfile (server/src/models/EmployerProfile.js)
   Fields: id(UUID PK), user_id(UUID FKâ†’User), company_name(STRING 255),
   company_slug(STRING 255, unique), logo_url(TEXT null), website_url(TEXT null),
   industry(STRING 100 null), company_size(ENUM: 1-10,11-50,51-200,201-500,500+),
   founded_year(INTEGER null), description(TEXT null), culture_text(TEXT null),
   headquarters(STRING 255 null), is_verified(BOOLEAN false),
   subscription_plan(ENUM: free,professional,business,enterprise â€” default free),
   subscription_expires_at(DATE null), job_post_limit(INTEGER 2),
   stripe_customer_id(STRING null)

4. JobListing (server/src/models/JobListing.js)
   Fields: id(UUID PK), employer_id(UUID FKâ†’EmployerProfile),
   category_id(UUID FKâ†’JobCategory null), title(STRING 255), slug(STRING 300, unique),
   description(TEXT), requirements(TEXT null),
   job_type(ENUM: full_time,part_time,contract,internship,freelance),
   work_mode(ENUM: onsite,remote,hybrid),
   experience_level(ENUM: entry,mid,senior,lead,executive),
   location_city(STRING 100 null), location_country(STRING 100),
   is_remote_global(BOOLEAN false), salary_min(INTEGER null), salary_max(INTEGER null),
   salary_currency(STRING 3, default USD), salary_period(ENUM: hourly,monthly,annual),
   application_deadline(DATE null), external_url(TEXT null),
   status(ENUM: draft,active,paused,closed,expired â€” default draft),
   is_featured(BOOLEAN false), views_count(INTEGER 0), applications_count(INTEGER 0),
   published_at(DATE null), expires_at(DATE null)
   Indexes: [employer_id], [status, published_at], [location_country, location_city],
   FULLTEXT on [title, description] using PostgreSQL tsvector

5. Application (server/src/models/Application.js)
   Fields: id(UUID PK), job_id(UUID FKâ†’JobListing), seeker_id(UUID FKâ†’SeekerProfile),
   resume_id(UUID FKâ†’Resume null), cover_letter(TEXT null),
   ats_stage(ENUM: applied,reviewing,shortlisted,interview,offer,hired,rejected â€” default applied),
   employer_rating(INTEGER null, validate 1-5), employer_notes(TEXT null),
   rejection_reason(STRING 500 null), withdrawn_at(DATE null)
   Unique constraint: [job_id, seeker_id]

6. Resume (server/src/models/Resume.js)
   Fields: id(UUID PK), seeker_id(UUID FKâ†’SeekerProfile), file_name(STRING 255),
   storage_path(TEXT), file_size_bytes(INTEGER), mime_type(STRING 100),
   is_default(BOOLEAN false), label(STRING 100 null),
   parsed_data(JSONB null), parse_status(ENUM: pending,processing,done,failed â€” default pending),
   parse_confidence(DECIMAL(5,2) null)

7. WorkExperience (server/src/models/WorkExperience.js)
   Fields: id(UUID PK), seeker_id(UUID FKâ†’SeekerProfile), job_title(STRING 255),
   company_name(STRING 255), location(STRING 255 null), employment_type(STRING 50 null),
   start_date(DATE), end_date(DATE null), is_current(BOOLEAN false),
   description(TEXT null), display_order(INTEGER 0)

8. Education (server/src/models/Education.js)
   Fields: id(UUID PK), seeker_id(UUID FKâ†’SeekerProfile), degree(STRING 255),
   field_of_study(STRING 255 null), institution(STRING 255), location(STRING 255 null),
   start_year(INTEGER), end_year(INTEGER null), is_current(BOOLEAN false),
   grade(STRING 50 null), description(TEXT null)

9. Skill (server/src/models/Skill.js)
   Fields: id(UUID PK), name(STRING 100, unique), slug(STRING 100, unique),
   category(STRING 100 null)

10. SeekerSkill (server/src/models/SeekerSkill.js) â€” junction table
    Fields: seeker_id(UUID FK), skill_id(UUID FK), 
    proficiency(ENUM: beginner,intermediate,advanced,expert),
    years_experience(INTEGER null)

11. JobSkill (server/src/models/JobSkill.js) â€” junction table
    Fields: job_id(UUID FK), skill_id(UUID FK), is_required(BOOLEAN true),
    proficiency(ENUM: beginner,intermediate,advanced,expert null)

12. JobCategory (server/src/models/JobCategory.js)
    Fields: id(UUID PK), name(STRING 100), slug(STRING 100, unique),
    icon(STRING 50 null), parent_id(UUID FKâ†’JobCategory null), job_count(INTEGER 0)

13. SavedJob (server/src/models/SavedJob.js)
    Fields: id(UUID PK), seeker_id(UUID FKâ†’SeekerProfile), job_id(UUID FKâ†’JobListing)
    Unique: [seeker_id, job_id]

14. JobAlert (server/src/models/JobAlert.js)
    Fields: id(UUID PK), seeker_id(UUID FKâ†’SeekerProfile), name(STRING 100),
    keywords(STRING 500 null), location(STRING 255 null), job_type(STRING null),
    work_mode(STRING null), experience_level(STRING null), salary_min(INTEGER null),
    frequency(ENUM: daily,weekly â€” default daily), is_active(BOOLEAN true),
    last_sent_at(DATE null)

15. Notification (server/src/models/Notification.js)
    Fields: id(UUID PK), user_id(UUID FKâ†’User), type(STRING 100),
    title(STRING 255), body(TEXT), metadata(JSONB null default {}),
    is_read(BOOLEAN false), read_at(DATE null)

16. AuditLog (server/src/models/AuditLog.js)
    Fields: id(UUID PK), user_id(UUID FKâ†’User null), action(STRING 100),
    entity_type(STRING 100), entity_id(UUID null), old_values(JSONB null),
    new_values(JSONB null), ip_address(STRING 45 null), user_agent(TEXT null)

ASSOCIATIONS TO DEFINE (in server/src/models/index.js):
- User hasOne SeekerProfile, hasOne EmployerProfile, hasMany Notification, hasMany AuditLog
- SeekerProfile belongsTo User
- SeekerProfile hasMany WorkExperience, hasMany Education, hasMany Resume, hasMany Application, hasMany SavedJob, hasMany JobAlert
- SeekerProfile belongsToMany Skill through SeekerSkill
- EmployerProfile belongsTo User, hasMany JobListing
- JobListing belongsTo EmployerProfile, belongsTo JobCategory, hasMany Application, hasMany SavedJob
- JobListing belongsToMany Skill through JobSkill
- Application belongsTo JobListing, belongsTo SeekerProfile, belongsTo Resume
- Resume belongsTo SeekerProfile

Show all model files and the complete index.js with associations.
```

---

## Expected Output Files

```
server/src/models/
â”œâ”€â”€ index.js              â† associations hub + exports
â”œâ”€â”€ User.js
â”œâ”€â”€ SeekerProfile.js
â”œâ”€â”€ EmployerProfile.js
â”œâ”€â”€ JobListing.js
â”œâ”€â”€ Application.js
â”œâ”€â”€ Resume.js
â”œâ”€â”€ WorkExperience.js
â”œâ”€â”€ Education.js
â”œâ”€â”€ Skill.js
â”œâ”€â”€ SeekerSkill.js
â”œâ”€â”€ JobSkill.js
â”œâ”€â”€ JobCategory.js
â”œâ”€â”€ SavedJob.js
â”œâ”€â”€ JobAlert.js
â”œâ”€â”€ Notification.js
â””â”€â”€ AuditLog.js
```

---

## Key Concepts to Learn

- **UUID vs Integer PKs** â€” UUIDs prevent sequential ID enumeration attacks; use `DataTypes.UUID` + `defaultValue: DataTypes.UUIDV4`
- **Sequelize associations** â€” `hasOne`, `hasMany`, `belongsTo`, `belongsToMany`; the difference between FK placement in each
- **JSONB in PostgreSQL** â€” stores JSON with indexing capability; used for `parsed_data` and `metadata`
- **Sequelize hooks** â€” `beforeCreate`, `beforeUpdate` for password hashing; `afterCreate` for profile initialization
- **Junction tables** â€” `belongsToMany` through a model; allows extra attributes on the join (like `proficiency`)
- **Unique constraints** â€” `unique: true` on single field vs `{ fields: ['job_id', 'seeker_id'] }` for composite

---

## Common Patterns to Understand

```javascript
// UUID primary key pattern (use in every model)
id: {
  type: DataTypes.UUID,
  defaultValue: DataTypes.UUIDV4,
  primaryKey: true,
}

// ENUM pattern
role: {
  type: DataTypes.ENUM('seeker', 'employer', 'admin'),
  allowNull: false,
}

// Foreign key pattern
user_id: {
  type: DataTypes.UUID,
  allowNull: false,
  references: { model: 'Users', key: 'id' },
  onDelete: 'CASCADE',
}

// JSONB pattern (PostgreSQL only)
metadata: {
  type: DataTypes.JSONB,
  defaultValue: {},
}
```

---

## Validation Checklist

- [ ] `npm run db:migrate` creates all tables with correct columns
- [ ] All foreign key relationships work in PostgreSQL
- [ ] `User.create({ email, password_hash, role, full_name })` auto-hashes password via hook
- [ ] `user.validatePassword('plaintext')` returns true/false
- [ ] `user.toSafeJSON()` returns object without `password_hash`
- [ ] Associations work: `User.findOne({ include: [SeekerProfile] })`
- [ ] Unique constraint error thrown on duplicate `[job_id, seeker_id]` in Application

---

## Next Step
Move to **Prompt 04 â€” Authentication Backend** once all models sync without errors.

