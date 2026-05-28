import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { UPLOADS_ROOT } from '../config/paths.js';
import { sendError } from '../utils/response.utils.js';

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIMES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx']);

// ── Multer disk storage ───────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    // Per-user subfolder: uploads/resumes/{userId}/
    const dir = path.join(UPLOADS_ROOT, 'resumes', req.user.id);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    // e.g. 1716900123456-a3f8z2.pdf
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, unique);
  },
});

// ── File filter (MIME + extension double-check) ───────────────────────────────

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIMES.has(file.mimetype) && ALLOWED_EXTENSIONS.has(ext)) {
    return cb(null, true);
  }
  const err = new Error('Only PDF, DOC, and DOCX files are allowed.');
  err.code = 'INVALID_FILE_TYPE';
  cb(err, false);
}

// ── Multer instance ───────────────────────────────────────────────────────────

const _multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_BYTES, files: 1 },
}).single('resume');

// ── Public middleware ─────────────────────────────────────────────────────────

/**
 * Wraps multer so its errors return clean JSON instead of falling through to
 * the global error handler with a 500 status.
 */
export const resumeUpload = (req, res, next) => {
  _multerUpload(req, res, (err) => {
    if (!err) return next();

    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'File must not exceed 10 MB.', 413);
    }
    if (err.code === 'INVALID_FILE_TYPE') {
      return sendError(res, err.message, 422);
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return sendError(res, 'Unexpected field name — use "resume" as the form-data key.', 422);
    }
    return next(err);
  });
};
