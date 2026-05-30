# Companies — Jira Notes

---

## Epic: JP-CO — Company Profiles & Directory

**Priority:** High | **Status:** Production

---

## Stories

### JP-CO-001: Company Profile Setup
**Points:** 3 | **Status:** Done

As an employer, I want to set up a branded company profile so that job seekers can learn about my company.

**AC:**
- [ ] All profile fields editable in employer dashboard
- [ ] Logo upload with preview
- [ ] Cover photo support
- [ ] Changes reflected on public profile within 60 seconds

### JP-CO-002: Public Company Page
**Points:** 3 | **Status:** Done

As a job seeker, I want to view a company's profile page so that I can research potential employers.

**AC:**
- [ ] Route: /companies/:slug
- [ ] Shows company info + all active job listings
- [ ] Profile view counter increments

### JP-CO-003: Company Directory
**Points:** 2 | **Status:** Done

As a job seeker, I want to browse hiring companies so that I can discover new opportunities.

**AC:**
- [ ] /companies page with search + filters
- [ ] Only companies with active listings shown

---

## Known Limitations

- No verification/badge system for companies (e.g., "Verified Employer") — planned for v2
- Image resizing is basic (local sharp); no CDN image transformation in MVP
