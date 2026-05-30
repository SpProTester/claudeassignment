# Companies — Backend Flow

---

## Get Company Profile

```
GET /api/companies/:slug
  │
  ├─ companies.controller.js → getCompanyBySlug(req, res, next)
  │     └─ EmployerProfile.findOne({ where: { company_slug: slug } })
  │     └─ Include: active JobListings (status='active', expires_at > now)
  │     └─ Increment: profile_views += 1 (async, fire-and-forget)
  └─ Response 200
```

## Update Company Profile

```
PUT /api/employer/company
  │
  ├─ [authenticateToken + authorizeRole('employer')]
  ├─ companies.controller.js → updateCompany(req, res, next)
  │     └─ Load EmployerProfile by userId
  │     └─ If company_name changed: regenerate company_slug (check uniqueness)
  │     └─ EmployerProfile.update(sanitizedFields)
  └─ Response 200: updated profile
```

## Logo Upload

```
POST /api/employer/company/logo
  │
  ├─ [authenticateToken + authorizeRole('employer')]
  ├─ Multer middleware: images only, max 2MB
  ├─ companies.controller.js → uploadLogo(req, res, next)
  │     └─ fileService.saveFile(req.file, 'logos')
  │           → resize to 200×200 (sharp)
  │           → save to uploads/logos/{slug}.{ext}  (or S3 in prod)
  │     └─ EmployerProfile.update({ logo_url: fileUrl })
  └─ Response 200: { logo_url }
```

## Company Directory

```
GET /api/companies
  │
  ├─ Build WHERE:
  │   has active job_listings (subquery or JOIN)
  │   AND (q ? company_name ILIKE %q% : true)
  │   AND (industry ? industry = ? : true)
  │   AND (size ? company_size = ? : true)
  ├─ Include: active_jobs_count (subquery COUNT)
  └─ Response 200: paginated list
```
