# Prompt 07 — Resume Upload & Management Backend

## Phase
Phase 3 — Job Seeker Module

## Objective
Build resume upload with Multer, file storage, basic PDF text extraction, and resume management endpoints.

---

## Prompt to Use

```
Build resume upload and management system for the Job Portal backend.

1. server/src/config/multer.js:
   - Configure Multer with diskStorage
   - Destination: uploads/resumes/{userId}/
   - Filename: {uuid}-{timestamp}{ext} (never use original filename for security)
   - File filter: accept only application/pdf, application/msword,
     application/vnd.openxmlformats-officedocument.wordprocessingml.document
   - Size limit: 10MB (10 * 1024 * 1024 bytes)
   - On rejection: throw AppError(400, 'Only PDF and Word documents are allowed, max 10MB')
   - Export: resumeUpload = multer({ storage, fileFilter, limits })

2. server/src/utils/fileUtils.js:
   - extractTextFromPDF(filePath):
     - Use pdf-parse library
     - Return extracted text string
     - On error: return null (don't throw — parsing failure is non-critical)
   - deleteFile(filePath):
     - Use fs.promises.unlink
     - Log error but don't throw if file not found
   - getFileUrl(storagePath):
     - In development: return http://localhost:5000/uploads/{storagePath}
     - In production: return CDN URL from env
   - validateFileIntegrity(filePath, mimeType):
     - Use file-type library to check actual file content vs extension
     - Return { valid: boolean, actualType: string }

3. server/src/services/resumeService.js:

   uploadResume(userId, file, label):
   - Find seeker profile by userId
   - Check resume count < 5 (max limit)
   - Validate file integrity using validateFileIntegrity
   - Create Resume record: {
       seeker_id, file_name: file.originalname, storage_path: file.path,
       file_size_bytes: file.size, mime_type: file.mimetype,
       label: label || file.originalname, parse_status: 'pending'
     }
   - If seeker has no default resume: set is_default = true
   - Queue resume parsing (call parseResumeAsync in background — don't await)
   - Return created resume record

   parseResumeAsync(resumeId, filePath):
   - Update parse_status = 'processing'
   - Extract text with extractTextFromPDF
   - If text empty: update parse_status = 'failed', return
   - Basic extraction (without AI for now):
     - Extract email: regex /[\w.-]+@[\w-]+\.[a-zA-Z]{2,}/
     - Extract phone: regex for common phone patterns
     - Extract skills: match against skills table names found in text
   - Save extracted data to parsed_data JSONB field
   - Update parse_status = 'done', parse_confidence = 70 (basic parser)

   getResumes(userId) — list resumes for seeker, ordered by created_at DESC
   
   deleteResume(userId, resumeId):
   - Verify ownership
   - Check resume not used in any active application
   - Delete file from disk
   - Delete DB record
   - If deleted was default and other resumes exist: set next one as default
   
   setDefaultResume(userId, resumeId):
   - Verify ownership
   - Set all other resumes is_default = false
   - Set this one is_default = true

   downloadResume(userId, resumeId, requesterRole):
   - If requester is seeker: verify ownership
   - If requester is employer: check application exists between seeker and one of employer's jobs
   - If requester is admin: always allowed
   - Return { filePath, fileName, mimeType }

4. server/src/controllers/resumeController.js:
   - upload (handles Multer, calls service, returns 201)
   - list
   - delete
   - setDefault
   - download (streams file using res.download())

5. server/src/routes/seekers.js — ADD resume routes:
   POST   /resume            → resumeUpload.single('resume'), resumeController.upload
   GET    /resume            → resumeController.list
   DELETE /resume/:id        → resumeController.delete
   PUT    /resume/:id/default → resumeController.setDefault
   GET    /resume/:id/download → resumeController.download

6. Static file serving in app.js:
   - app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
   - Only serve in development; in production use proper CDN

INSTALL: npm install multer pdf-parse file-type uuid
```

---

## Key Concepts to Learn

- **Multer** — multipart form data parser; `diskStorage` saves to disk vs `memoryStorage` (holds in RAM); always use `diskStorage` for large files
- **File type spoofing** — users can rename `malware.exe` to `resume.pdf`; always validate actual file content using `file-type` library, not just the extension
- **Streaming file download** — `res.download(filePath, fileName)` sets proper headers and streams; never load whole file into memory for large files
- **Background processing** — fire-and-forget with `parseResumeAsync(id, path)` without `await`; the upload responds immediately and parsing happens in background
- **Storage path security** — never expose real file system paths in responses; use UUIDs as filenames; serve through a controlled route

---

## Validation Checklist

- [ ] Upload PDF/DOCX — success with 201
- [ ] Upload .exe renamed to .pdf — rejected (file-type check)
- [ ] Upload 11MB file — rejected with size error message
- [ ] Upload 6th resume — rejected with "maximum 5 resumes" error
- [ ] List resumes returns all with `file_url` for preview
- [ ] Delete resume updates default correctly
- [ ] Download streams file correctly
- [ ] `parse_status` changes from `pending` → `processing` → `done`

---

## Next Step
**Prompt 08 — Seeker Frontend Dashboard**
