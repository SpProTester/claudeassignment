# Companies — Frontend Flow

---

## Public Company Profile

```
/companies/:slug
  ↓
CompanyProfile.jsx:
  ├─ Hero section: cover photo, logo, company name, industry, size, location
  ├─ "About" tab: description + culture description
  ├─ "Open Roles" tab: active job listings from this company (JobCard list)
  └─ Sidebar: website link, LinkedIn, headquarters, founded year, profile views
```

## Employer Company Edit

```
/employer/company
  ↓
EmployerCompany.jsx:
  ├─ Logo upload (drag-and-drop + preview)
  ├─ Cover photo upload
  ├─ Form: company_name, industry, company_size, founded_year
  ├─ Location: headquarters_city, headquarters_country
  ├─ Links: website_url, linkedin_url
  ├─ Text areas: description (rich text), culture_description
  └─ Save button → PUT /api/employer/company

Logo upload flow:
  User drops/selects file
  → Validate: type (image/*), size (≤ 2MB)
  → Preview in-page
  → POST /api/employer/company/logo (multipart)
  → Update logo_url in state, show success toast
```
