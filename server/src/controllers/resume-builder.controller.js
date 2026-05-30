import PDFDocument from 'pdfkit';
import { Resume, ResumeTemplate } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function resumeWithTemplate(resume) {
  const obj = resume.toJSON ? resume.toJSON() : { ...resume };
  delete obj.parsedData; // exclude large field from list responses
  return obj;
}

async function findOwnedBuilt(id, seekerId, res) {
  const resume = await Resume.findOne({
    where: { id, seekerId },
    include: [{ model: ResumeTemplate, as: 'template' }],
  });
  if (!resume) { sendError(res, 'Resume not found.', 404); return null; }
  if (resume.resumeType !== 'built') { sendError(res, 'This resume cannot be edited in the builder.', 400); return null; }
  return resume;
}

// ── GET /api/seekers/resume/templates ────────────────────────────────────────

export const listTemplates = async (req, res, next) => {
  try {
    const templates = await ResumeTemplate.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']],
    });
    sendSuccess(res, { templates });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/seekers/resume/builder ─────────────────────────────────────────

export const createBuiltResume = async (req, res, next) => {
  try {
    const { label, templateId, resumeContent } = req.body;

    if (!templateId) return sendError(res, 'templateId is required.', 400);

    const template = await ResumeTemplate.findOne({ where: { id: templateId, isActive: true } });
    if (!template) return sendError(res, 'Invalid or disabled template.', 400);

    const existingCount = await Resume.count({ where: { seekerId: req.user.id } });

    const resume = await Resume.create({
      seekerId:      req.user.id,
      fileName:      null,
      storagePath:   null,
      fileSize:      null,
      isDefault:     existingCount === 0,
      label:         label?.trim() || `Resume – ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      resumeType:    'built',
      templateId,
      resumeContent: resumeContent ?? defaultContent(req.user),
    });

    sendSuccess(res, { resume: resumeWithTemplate(resume) }, 'Resume created.', 201);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/seekers/resume/:id ──────────────────────────────────────────────

export const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      where: { id: req.params.id, seekerId: req.user.id },
      include: [{ model: ResumeTemplate, as: 'template' }],
    });
    if (!resume) return sendError(res, 'Resume not found.', 404);
    sendSuccess(res, { resume: resume.toJSON() });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/seekers/resume/:id ──────────────────────────────────────────────

export const updateBuiltResume = async (req, res, next) => {
  try {
    const resume = await findOwnedBuilt(req.params.id, req.user.id, res);
    if (!resume) return;

    const { label, templateId, resumeContent } = req.body;

    if (templateId && templateId !== resume.templateId) {
      const tpl = await ResumeTemplate.findOne({ where: { id: templateId, isActive: true } });
      if (!tpl) return sendError(res, 'Invalid or disabled template.', 400);
    }

    await resume.update({
      ...(label         !== undefined && { label: label?.trim() }),
      ...(templateId    !== undefined && { templateId }),
      ...(resumeContent !== undefined && { resumeContent }),
    });

    await resume.reload({ include: [{ model: ResumeTemplate, as: 'template' }] });
    sendSuccess(res, { resume: resumeWithTemplate(resume) }, 'Resume updated.');
  } catch (err) {
    next(err);
  }
};

// ── GET /api/seekers/resume/:id/export ───────────────────────────────────────
// Streams a PDF back to the caller. Works for both uploaded and built resumes.

export const exportResumePdf = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      where: { id: req.params.id, seekerId: req.user.id },
      include: [{ model: ResumeTemplate, as: 'template' }],
    });
    if (!resume) return sendError(res, 'Resume not found.', 404);

    if (resume.resumeType === 'uploaded' && resume.storagePath) {
      // For uploaded files, redirect to the static file URL
      const { toPublicUrl } = await import('../services/file.service.js');
      return res.redirect(toPublicUrl(resume.storagePath));
    }

    const content = resume.resumeContent ?? {};
    const label = resume.label || 'Resume';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(label)}.pdf"`);

    const doc = buildPdf(content);
    doc.pipe(res);
    doc.end();
  } catch (err) {
    next(err);
  }
};

// ── PDF generation (pdfkit) ──────────────────────────────────────────────────

export function buildPdfFromContent(c) {
  return buildPdf(c);
}

function buildPdf(c) {
  const doc = new PDFDocument({ size: 'A4', margins: { top: 50, bottom: 50, left: 60, right: 60 } });
  const PAGE_W = doc.page.width - 120; // usable width (margins subtracted)

  const info = c.personalInfo ?? {};
  const accentHex = '#7600CF';

  // ── Header ──────────────────────────────────────────────────────────────
  if (info.fullName) {
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#111827').text(info.fullName);
  }
  if (info.jobTitle) {
    doc.fontSize(12).font('Helvetica').fillColor(accentHex).text(info.jobTitle);
  }

  const contactParts = [info.email, info.phone, info.location, info.website].filter(Boolean);
  if (contactParts.length) {
    doc.moveDown(0.3).fontSize(9).fillColor('#4B5563').font('Helvetica').text(contactParts.join('  ·  '));
  }

  const linkParts = [];
  if (info.linkedin)  linkParts.push(`LinkedIn: ${info.linkedin}`);
  if (info.github)    linkParts.push(`GitHub: ${info.github}`);
  if (info.portfolio) linkParts.push(`Portfolio: ${info.portfolio}`);
  if (linkParts.length) {
    doc.fontSize(9).fillColor('#6B7280').text(linkParts.join('  ·  '));
  }

  rule(doc, PAGE_W);

  // ── Summary ──────────────────────────────────────────────────────────────
  if (c.summary) {
    sectionHeader(doc, 'PROFESSIONAL SUMMARY', accentHex);
    doc.fontSize(10).font('Helvetica').fillColor('#374151').text(c.summary, { lineGap: 3 });
    doc.moveDown(0.5);
  }

  // ── Experience ───────────────────────────────────────────────────────────
  if (c.experience?.length) {
    sectionHeader(doc, 'EXPERIENCE', accentHex);
    c.experience.forEach((exp) => {
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#111827').text(exp.title ?? '');
      const dateRange = [exp.startDate, exp.isCurrent ? 'Present' : exp.endDate].filter(Boolean).join(' – ');
      doc.fontSize(10).font('Helvetica').fillColor('#6B7280')
        .text([exp.company, exp.location, dateRange].filter(Boolean).join('  ·  '));
      if (exp.description) {
        doc.moveDown(0.2).fontSize(10).fillColor('#374151').text(exp.description, { lineGap: 2 });
      }
      doc.moveDown(0.4);
    });
  }

  // ── Education ────────────────────────────────────────────────────────────
  if (c.education?.length) {
    sectionHeader(doc, 'EDUCATION', accentHex);
    c.education.forEach((edu) => {
      const degree = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(', ');
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#111827').text(degree || edu.institution);
      const dateRange = [edu.startDate, edu.isCurrent ? 'Present' : edu.endDate].filter(Boolean).join(' – ');
      doc.fontSize(10).font('Helvetica').fillColor('#6B7280')
        .text([edu.institution, dateRange, edu.grade].filter(Boolean).join('  ·  '));
      if (edu.description) {
        doc.moveDown(0.2).fontSize(10).fillColor('#374151').text(edu.description, { lineGap: 2 });
      }
      doc.moveDown(0.4);
    });
  }

  // ── Skills ───────────────────────────────────────────────────────────────
  if (c.skills?.length) {
    sectionHeader(doc, 'SKILLS', accentHex);
    doc.fontSize(10).font('Helvetica').fillColor('#374151').text(c.skills.join('  ·  '), { lineGap: 3 });
    doc.moveDown(0.4);
  }

  // ── Certifications ───────────────────────────────────────────────────────
  if (c.certifications?.length) {
    sectionHeader(doc, 'CERTIFICATIONS', accentHex);
    c.certifications.forEach((cert) => {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827').text(cert.name ?? '');
      const parts = [cert.issuingOrganization, cert.issueDate, cert.credentialId].filter(Boolean);
      if (parts.length) doc.fontSize(9).font('Helvetica').fillColor('#6B7280').text(parts.join('  ·  '));
      doc.moveDown(0.3);
    });
  }

  // ── Projects ─────────────────────────────────────────────────────────────
  if (c.projects?.length) {
    sectionHeader(doc, 'PROJECTS', accentHex);
    c.projects.forEach((proj) => {
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#111827').text(proj.name ?? '');
      if (proj.technologies?.length) {
        doc.fontSize(9).font('Helvetica').fillColor(accentHex).text(proj.technologies.join(', '));
      }
      if (proj.description) {
        doc.moveDown(0.2).fontSize(10).fillColor('#374151').font('Helvetica').text(proj.description, { lineGap: 2 });
      }
      doc.moveDown(0.3);
    });
  }

  // ── Achievements ─────────────────────────────────────────────────────────
  if (c.achievements?.length) {
    sectionHeader(doc, 'ACHIEVEMENTS', accentHex);
    c.achievements.forEach((ach) => {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827').text([ach.title, ach.date].filter(Boolean).join('  –  '));
      if (ach.description) {
        doc.fontSize(10).font('Helvetica').fillColor('#374151').text(ach.description, { lineGap: 2 });
      }
      doc.moveDown(0.3);
    });
  }

  // ── Languages ────────────────────────────────────────────────────────────
  if (c.languages?.length) {
    sectionHeader(doc, 'LANGUAGES', accentHex);
    doc.fontSize(10).font('Helvetica').fillColor('#374151')
      .text(c.languages.map((l) => `${l.language} (${l.proficiency})`).join('  ·  '), { lineGap: 3 });
    doc.moveDown(0.4);
  }

  // ── References ───────────────────────────────────────────────────────────
  if (c.references?.length) {
    sectionHeader(doc, 'REFERENCES', accentHex);
    c.references.forEach((ref) => {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827').text(ref.name ?? '');
      const parts = [ref.title, ref.company, ref.email, ref.phone].filter(Boolean);
      if (parts.length) doc.fontSize(9).font('Helvetica').fillColor('#6B7280').text(parts.join('  ·  '));
      doc.moveDown(0.3);
    });
  }

  return doc;
}

function rule(doc, width) {
  const y = doc.y + 6;
  doc.moveTo(60, y).lineTo(60 + width, y).strokeColor('#E5E7EB').lineWidth(1).stroke();
  doc.moveDown(0.5);
}

function sectionHeader(doc, title, color) {
  doc.fontSize(10).font('Helvetica-Bold').fillColor(color).text(title);
  doc.moveDown(0.25);
}

// ── Default empty content ────────────────────────────────────────────────────

function defaultContent(user) {
  return {
    personalInfo: {
      fullName:  user?.fullName ?? '',
      jobTitle:  '',
      email:     user?.email   ?? '',
      phone:     '',
      location:  '',
      website:   '',
      linkedin:  '',
      github:    '',
      portfolio: '',
    },
    summary:        '',
    experience:     [],
    education:      [],
    skills:         [],
    certifications: [],
    projects:       [],
    achievements:   [],
    languages:      [],
    references:     [],
  };
}
