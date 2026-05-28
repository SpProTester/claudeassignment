import { Resume } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';
import { virusScan, extractPdfText, deleteFile, toPublicUrl } from '../services/file.service.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Attaches a computed `url` field to each resume plain object. */
function withUrl(resume) {
  const obj = resume.toJSON ? resume.toJSON() : { ...resume };
  obj.url = toPublicUrl(obj.storagePath);
  return obj;
}

/** Finds a resume owned by the authenticated seeker or returns 404. */
async function findOwned(id, seekerId, res) {
  const resume = await Resume.findOne({ where: { id, seekerId } });
  if (!resume) {
    sendError(res, 'Resume not found.', 404);
    return null;
  }
  return resume;
}

// ── POST /api/seekers/resume ──────────────────────────────────────────────────

export const uploadResume = async (req, res, next) => {
  const { file, user } = req;

  if (!file) return sendError(res, 'No file provided. Use multipart/form-data with field "resume".', 400);

  try {
    // 1. Virus-check stub — magic-byte validation
    const scan = await virusScan(file.path, file.mimetype);
    if (!scan.valid) {
      await deleteFile(file.path);
      return sendError(res, scan.reason, 422);
    }

    // 2. Text extraction (PDF only; DOC/DOCX skipped — needs separate lib)
    let parsedData = null;
    if (scan.detectedType === 'pdf') {
      try {
        parsedData = await extractPdfText(file.path);
      } catch {
        parsedData = { error: 'Text extraction failed.', extractedAt: new Date().toISOString() };
      }
    }

    // 3. First resume for this seeker becomes default automatically
    const existingCount = await Resume.count({ where: { seekerId: user.id } });

    const resume = await Resume.create({
      seekerId: user.id,
      fileName: file.originalname,
      storagePath: file.path,
      fileSize: file.size,
      label: req.body.label?.trim() || null,
      isDefault: existingCount === 0,
      parsedData,
    });

    sendSuccess(res, { resume: withUrl(resume) }, 'Resume uploaded.', 201);
  } catch (err) {
    // Clean up orphaned file if DB write fails
    if (file?.path) await deleteFile(file.path).catch(() => {});
    next(err);
  }
};

// ── GET /api/seekers/resume ───────────────────────────────────────────────────

export const listResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.findAll({
      where: { seekerId: req.user.id },
      // parsedData can be large; exclude from list, available on explicit fetch
      attributes: { exclude: ['parsedData'] },
      order: [
        ['isDefault', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });

    sendSuccess(res, { resumes: resumes.map(withUrl) });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/seekers/resume/:id ────────────────────────────────────────────

export const deleteResume = async (req, res, next) => {
  try {
    const resume = await findOwned(req.params.id, req.user.id, res);
    if (!resume) return;

    const wasDefault = resume.isDefault;
    const storagePath = resume.storagePath;

    await resume.destroy();
    await deleteFile(storagePath);

    // If the deleted resume was the default, promote the most recent remaining one
    if (wasDefault) {
      const promoted = await Resume.findOne({
        where: { seekerId: req.user.id },
        order: [['createdAt', 'DESC']],
      });
      if (promoted) await promoted.update({ isDefault: true });
    }

    sendSuccess(res, null, 'Resume deleted.');
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/seekers/resume/:id/default ──────────────────────────────────────

export const setDefaultResume = async (req, res, next) => {
  try {
    const resume = await findOwned(req.params.id, req.user.id, res);
    if (!resume) return;

    // Atomic swap: clear all, then set the target
    await Resume.update({ isDefault: false }, { where: { seekerId: req.user.id } });
    await resume.update({ isDefault: true });

    sendSuccess(res, { resume: withUrl(resume) }, 'Default resume updated.');
  } catch (err) {
    next(err);
  }
};
