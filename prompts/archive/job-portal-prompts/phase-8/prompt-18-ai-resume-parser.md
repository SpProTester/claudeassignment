# Prompt 18 — AI Resume Parser

## Phase
Phase 8 — AI Features

## Objective
Enhance resume parsing with OpenAI GPT-4 to extract structured data and auto-populate seeker profiles.

---

## Prompt to Use

```
Build AI-powered resume parser using OpenAI GPT-4 for the Job Portal.

1. server/src/config/openai.js:
   - Initialize OpenAI client with OPENAI_API_KEY from env
   - Export openai instance
   - Export MODELS constant: { parser: 'gpt-4o-mini', recommender: 'gpt-4o-mini' }
   - Note: Use gpt-4o-mini for cost efficiency; gpt-4 for higher accuracy

2. server/src/services/resumeParserService.js:

   parseResumeWithAI(resumeId):
   - Find resume by id
   - Update parse_status = 'processing'
   - Extract text from file:
     - PDF: use pdf-parse
     - DOCX: use mammoth library (npm install mammoth)
   - If text < 100 chars: mark as failed (probably scanned image PDF)
   - Build OpenAI prompt (see PROMPT below)
   - Call openai.chat.completions.create()
   - Parse JSON response
   - Validate response structure
   - Save to resume.parsed_data
   - Call updateProfileFromResume(seekerId, parsedData)
   - Update parse_status = 'done', parse_confidence = response.confidence
   - Return parsed data

   OPENAI PROMPT:
   system: "You are a professional resume parser. Extract information from the resume text and return ONLY valid JSON. No markdown, no explanation, just JSON."
   
   user: `Parse this resume and extract all information. Return JSON with this exact structure:
   {
     "confidence": 0-100,
     "personal": {
       "full_name": "", "email": "", "phone": "", "location": "",
       "linkedin_url": "", "github_url": "", "portfolio_url": ""
     },
     "summary": "",
     "experience_years": 0,
     "work_experience": [{
       "job_title": "", "company_name": "", "location": "",
       "start_date": "YYYY-MM", "end_date": "YYYY-MM or null",
       "is_current": false, "description": ""
     }],
     "education": [{
       "degree": "", "field_of_study": "", "institution": "",
       "start_year": 0, "end_year": 0, "grade": ""
     }],
     "skills": ["skill1", "skill2"],
     "certifications": [{ "name": "", "issuer": "", "year": 0 }]
   }
   
   Resume text:
   ${resumeText}
   `
   
   Handle errors:
   - OpenAI rate limit (429): wait 5s and retry once
   - JSON parse error: try to extract JSON from response, else mark failed
   - Timeout (30s): mark failed
   - Log all errors to Winston

   updateProfileFromResume(seekerId, parsedData):
   - Only update fields that are EMPTY in current profile (don't overwrite user edits)
   - Update SeekerProfile: headline (from first job title), summary, experience_years, location
   - Create WorkExperience records for each experience (skip if title+company already exists)
   - Create Education records (skip duplicates)
   - Find or create Skills by name, link to seeker (skip if already has skill)
   - Return { updated: true, changes: [...list of what was updated] }

3. Update server/src/services/resumeService.js:
   - In uploadResume: after creating Resume record, call:
     setImmediate(() => parseResumeWithAI(resume.id).catch(logger.error))
   - Add route: POST /seekers/resume/:id/parse → manually trigger re-parse

4. server/src/routes/seekers.js — ADD:
   POST /resume/:id/parse → parseResumeWithAI trigger

FRONTEND:

5. client/src/pages/seeker/ResumePage.jsx — UPDATE:
   After upload, show "AI is parsing your resume..." status chip
   Poll parse_status every 3 seconds while status is 'pending' or 'processing'
   When status = 'done': show "Resume parsed!" success message
   Link: "See what was extracted →" opens modal

6. client/src/components/seeker/ParseResultModal.jsx:
   - Show extracted data: name, contact info, N experience entries, N education entries, N skills
   - "Apply to Profile" button with checkboxes for each section to apply
   - User can deselect fields they don't want to overwrite
   - On confirm: call API to apply selected fields
   - "Dismiss" button if they want to fill manually
```

---

## Key Concepts to Learn

- **OpenAI structured outputs** — prompt the model to return only JSON; validate the structure; never trust AI output blindly
- **`gpt-4o-mini` vs `gpt-4`** — mini is 10x cheaper and fast enough for parsing; use gpt-4 only if accuracy requirements are very high
- **`setImmediate`** — defers execution to next event loop iteration; allows HTTP response to return before heavy async work starts
- **`mammoth`** — extracts clean text from DOCX files; better than custom XML parsing
- **Confidence score** — ask the model to self-assess; use it to flag low-confidence parses for manual review

---

## Validation Checklist

- [ ] Upload PDF → profile auto-populated with extracted data
- [ ] Upload DOCX → extracted correctly via mammoth
- [ ] Uploaded image-based PDF → marked as 'failed' with helpful message
- [ ] Manual re-parse trigger works
- [ ] Existing profile fields not overwritten by parser (merge, not replace)
- [ ] Parse result modal shows extracted data with apply options
- [ ] OpenAI rate limit handled with retry

---

## Next Step
**Prompt 19 — AI Job Recommendations**
