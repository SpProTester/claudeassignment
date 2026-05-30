# Companies Module

> Employer company profiles, branding, and public company pages.

---

## Overview

The Companies module manages the public-facing company profiles that employers maintain on the platform. A rich company profile increases job listing credibility and can drive organic traffic through the company directory.

**Scope:**
- Employer creates and maintains their company profile (description, logo, size, website)
- Public company profile page visible to all visitors
- Company directory (browseable, searchable list of hiring companies)
- Company profile linked to all job listings posted by that employer

---

## Key Files

| File | Responsibility |
|------|---------------|
| `server/src/controllers/companies.controller.js` | Company CRUD handlers |
| `server/src/models/EmployerProfile.js` | Company data model |
| `server/src/routes/companies.routes.js` | Public company routes |
| `client/src/pages/CompanyProfile.jsx` | Public company page |
| `client/src/pages/employer/EmployerCompany.jsx` | Employer company edit page |
| `client/src/services/employer.service.js` | Company API calls |

---

## Data Model Summary

The company data lives inside `employer_profiles` (not a separate table). Key fields:

- `company_name`, `company_slug` — identity
- `industry`, `company_size`, `founded_year` — metadata
- `logo_url`, `cover_url` — media
- `description`, `culture_description` — content
- `website_url`, `linkedin_url` — links
- `headquarters_city`, `headquarters_country` — location

---

## Related Docs

- [Requirements](requirements.md)
- [API Reference](api.md)
- [Database Schema](database-schema.md)
- [Frontend Flow](frontend-flow.md)
- [Backend Flow](backend-flow.md)
- [Test Cases](test-cases.md)
- [Jira Notes](jira-notes.md)
