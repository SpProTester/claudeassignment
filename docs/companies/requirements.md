# Companies — Requirements

---

## Functional Requirements

### FR-CO-001: Company Profile Creation
- Every employer SHALL have a company profile auto-created on registration
- Employer SHALL be able to update: company name, industry, size, website, description, headquarters location, social links
- System SHALL auto-generate a unique `company_slug` from the company name

### FR-CO-002: Company Logo & Media
- Employer SHALL be able to upload a company logo (JPEG/PNG/WebP, max 2MB)
- Employer SHALL optionally upload a cover photo for their profile page
- System SHALL resize and optimize uploaded images
- Stored images SHALL be served from CDN/S3 URL

### FR-CO-003: Public Company Page
- Any visitor SHALL be able to view a company profile at `/companies/:slug`
- The page SHALL show: logo, name, industry, size, description, active job listings
- System SHALL increment a `profile_views` counter per visit

### FR-CO-004: Company Directory
- Visitors SHALL be able to browse a directory of companies with active listings
- Directory SHALL support filtering by industry and company size
- Directory SHALL support keyword search by company name

---

## Non-Functional Requirements

- Company slug MUST be URL-safe and human-readable
- Profile pages MUST be server-renderable for SEO (or use SSG)
- Logo upload MUST reject files larger than 2MB with a clear error

---

## Acceptance Criteria

- [ ] Employer can update all profile fields in EmployerCompany.jsx
- [ ] Uploaded logo appears on public profile within 5 seconds
- [ ] `/companies` page lists companies with active jobs
- [ ] `/companies/:slug` renders correct company data
- [ ] Profile views counter increments on each visit
