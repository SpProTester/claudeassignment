# Companies — API Reference

---

## Public Endpoints

### GET /api/companies

Browse company directory.

**Auth:** None

**Query Parameters:** `q` (name search), `industry`, `size`, `page`, `limit`

**Response 200:**
```json
{
  "data": {
    "companies": [
      {
        "slug": "techcorp",
        "company_name": "TechCorp",
        "logo_url": "https://...",
        "industry": "Technology",
        "company_size": "51-200",
        "headquarters_city": "New York",
        "active_jobs_count": 5
      }
    ],
    "pagination": { "page": 1, "total": 80, "totalPages": 4 }
  }
}
```

---

### GET /api/companies/:slug

Get a specific company profile with active jobs.

**Auth:** None

**Response 200:**
```json
{
  "data": {
    "company": {
      "slug": "techcorp",
      "company_name": "TechCorp",
      "logo_url": "https://...",
      "cover_url": "https://...",
      "industry": "Technology",
      "company_size": "51-200",
      "founded_year": 2010,
      "website_url": "https://techcorp.com",
      "linkedin_url": "https://linkedin.com/company/techcorp",
      "description": "We build amazing software...",
      "headquarters_city": "New York",
      "headquarters_country": "US",
      "profile_views": 1240,
      "active_jobs": [ /* abbreviated job objects */ ]
    }
  }
}
```

---

## Employer Endpoints

### GET /api/employer/company

Get the employer's own company profile.

**Auth:** Bearer (employer)

**Response 200:** Full employer profile object.

---

### PUT /api/employer/company

Update company profile.

**Auth:** Bearer (employer)

**Request Body:**
```json
{
  "company_name": "TechCorp Inc.",
  "industry": "Technology",
  "company_size": "51-200",
  "founded_year": 2010,
  "website_url": "https://techcorp.com",
  "description": "...",
  "culture_description": "...",
  "headquarters_city": "New York",
  "headquarters_country": "US"
}
```

**Response 200:** Updated profile.

---

### POST /api/employer/company/logo

Upload company logo.

**Auth:** Bearer (employer)

**Content-Type:** `multipart/form-data`

**Body:** `logo: <file>` (JPEG/PNG/WebP, max 2MB)

**Response 200:** `{ "data": { "logo_url": "https://..." } }`

**Errors:** 400 if file too large or wrong format.
