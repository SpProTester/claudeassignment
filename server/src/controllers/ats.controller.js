import fs from 'fs';
import { Op } from 'sequelize';
import {
  sequelize,
  Application,
  JobListing,
  EmployerProfile,
  User,
  SeekerProfile,
  Resume,
} from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';
import { sendApplicationStatusEmail, sendInterviewScheduledEmail, sendEmployerEmail } from '../utils/email.utils.js';
import { createNotification } from '../services/notification.service.js';

// All valid ATS stages (mirrors the ENUM after migration 0019)
export const ATS_STAGES = [
  'applied',
  'screening',
  'reviewing',
  'shortlisted',
  'interview',
  'offer',
  'hired',
  'rejected',
];

// Copy used for notifications and emails when a stage transition occurs
const STAGE_COPY = {
  applied:     { title: 'Application Received',        body: 'Your application has been received and is being reviewed.' },
  screening:   { title: 'Application Under Review',    body: 'Your application is currently under review by the hiring team.' },
  reviewing:   { title: 'Application Under Review',    body: 'Your application is currently under review by the hiring team.' },
  shortlisted: { title: 'You Have Been Shortlisted!',  body: "Great news — you've been shortlisted for this role." },
  interview:   { title: 'Interview Invitation',        body: "Congratulations! You've been invited for an interview." },
  offer:       { title: 'Job Offer Extended',          body: "We're pleased to extend you an offer for this position." },
  hired:       { title: 'Welcome to the Team!',        body: "Congratulations — you've been hired for this role!" },
  rejected:    { title: 'Application Status Update',   body: "Thank you for your interest. Your application won't be moving forward at this time." },
};

// ── Shared auth helper ────────────────────────────────────────────────────────

/**
 * Loads an Application by PK, eager-loading the owning job + employer.
 * Returns { application, error } — error is null when access is granted.
 */
const resolveApplication = async (applicationId, userId, userRole) => {
  const application = await Application.findByPk(applicationId, {
    include: [
      {
        model: JobListing,
        as: 'job',
        attributes: ['id', 'title', 'employerId'],
        include: [
          {
            model: EmployerProfile,
            as: 'employer',
            attributes: ['id', 'userId', 'companyName'],
          },
        ],
      },
    ],
  });

  if (!application) {
    return { application: null, error: { msg: 'Application not found.', code: 404 } };
  }
  if (application.job.employer.userId !== userId && userRole !== 'admin') {
    return { application: null, error: { msg: 'Not authorised.', code: 403 } };
  }
  return { application, error: null };
};

// ── GET /employer/jobs/:id/applicants ─────────────────────────────────────────

export const listApplicants = async (req, res, next) => {
  try {
    const employer = await EmployerProfile.findOne({ where: { userId: req.user.id } });
    if (!employer) return sendError(res, 'Company profile not found.', 404);

    const job = await JobListing.findOne({
      where: { id: req.params.id, employerId: employer.id },
      attributes: ['id'],
    });
    if (!job) return sendError(res, 'Job not found or not authorised.', 404);

    const { atsStage, page = 1, limit = 20 } = req.query;
    const parsedPage  = Math.max(1, parseInt(page, 10));
    const parsedLimit = Math.min(500, Math.max(1, parseInt(limit, 10)));
    const offset = (parsedPage - 1) * parsedLimit;

    const where = { jobId: req.params.id };
    if (atsStage) where.atsStage = atsStage;

    const { count, rows: applications } = await Application.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'seeker',
          attributes: ['id', 'fullName', 'email'],
          include: [
            {
              model: SeekerProfile,
              as: 'seekerProfile',
              attributes: ['headline', 'location', 'experienceYears', 'openToWork'],
            },
          ],
        },
        {
          model: Resume,
          as: 'resume',
          attributes: ['id', 'fileName', 'fileSize', 'label'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parsedLimit,
      offset,
      distinct: true,
    });

    sendSuccess(res, {
      applications,
      pagination: {
        total: count,
        page: parsedPage,
        pages: Math.ceil(count / parsedLimit),
        limit: parsedLimit,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── PUT /employer/applicants/:id/stage ────────────────────────────────────────

export const updateAtsStage = async (req, res, next) => {
  try {
    const { application, error } = await resolveApplication(req.params.id, req.user.id, req.user.role);
    if (error) return sendError(res, error.msg, error.code);

    const { stage } = req.body;
    const previousStage = application.atsStage;

    await application.update({ atsStage: stage });

    const copy = STAGE_COPY[stage] ?? { title: 'Application Update', body: 'Your application status has been updated.' };
    const jobTitle = application.job.title;
    const companyName = application.job.employer.companyName;

    // Resolve seeker once for both notification and email
    const seeker = await User.findByPk(application.seekerId, { attributes: ['id', 'email', 'fullName'] }).catch(() => null);

    createNotification(application.seekerId, 'application_update', {
      title: copy.title,
      body: `${copy.body} — ${jobTitle} at ${companyName}`,
      metadata: { applicationId: application.id, jobId: application.jobId, stage, previousStage },
      email: seeker
        ? () => {
            if (stage === 'interview') {
              return sendInterviewScheduledEmail({
                to: seeker.email,
                seekerName: seeker.fullName,
                jobTitle,
                companyName,
                applicationId: application.id,
              });
            }
            return sendApplicationStatusEmail({ to: seeker.email, seekerName: seeker.fullName, jobTitle, companyName, stage, copy });
          }
        : null,
    }).catch((err) => console.error('[ats] createNotification failed:', err.message));

    sendSuccess(res, { application }, `Stage updated to "${stage}".`);
  } catch (err) {
    next(err);
  }
};

// ── POST /employer/applicants/:id/note ────────────────────────────────────────
//
// Notes are stored as a JSON array inside the TEXT employerNotes column.
// Each entry: { note, createdAt, authorId }
// The append-only structure preserves audit history without a separate table.

export const addNote = async (req, res, next) => {
  try {
    const { application, error } = await resolveApplication(req.params.id, req.user.id, req.user.role);
    if (error) return sendError(res, error.msg, error.code);

    let notes = [];
    if (application.employerNotes) {
      try {
        const parsed = JSON.parse(application.employerNotes);
        notes = Array.isArray(parsed) ? parsed : [];
      } catch {
        // Legacy plain-text note written by the old updateApplicationStatus endpoint
        notes = [{ note: application.employerNotes, createdAt: application.updatedAt?.toISOString(), authorId: null }];
      }
    }

    const newNote = {
      note: req.body.note,
      createdAt: new Date().toISOString(),
      authorId: req.user.id,
    };
    notes.push(newNote);

    await application.update({ employerNotes: JSON.stringify(notes) });
    sendSuccess(res, { notes }, 'Note added.');
  } catch (err) {
    next(err);
  }
};

// ── PUT /employer/applicants/:id/rating ──────────────────────────────────────

export const setRating = async (req, res, next) => {
  try {
    const { application, error } = await resolveApplication(req.params.id, req.user.id, req.user.role);
    if (error) return sendError(res, error.msg, error.code);

    await application.update({ employerRating: req.body.rating });
    sendSuccess(res, { employerRating: req.body.rating }, 'Rating saved.');
  } catch (err) {
    next(err);
  }
};

// ── GET /employer/applicants/:id/resume ───────────────────────────────────────

export const streamResume = async (req, res, next) => {
  try {
    const { application, error } = await resolveApplication(req.params.id, req.user.id, req.user.role);
    if (error) return sendError(res, error.msg, error.code);

    if (!application.resumeId) {
      return sendError(res, 'No resume is attached to this application.', 404);
    }

    const resume = await Resume.findByPk(application.resumeId, {
      attributes: ['id', 'fileName', 'storagePath', 'resumeType', 'resumeContent', 'label', 'templateId'],
    });
    if (!resume) return sendError(res, 'Resume record not found.', 404);

    if (resume.resumeType === 'built') {
      // Dynamically generate a PDF from the stored resume content
      const { default: PDFDocument } = await import('pdfkit');
      const { buildPdfFromContent } = await import('./resume-builder.controller.js');

      const content = resume.resumeContent ?? {};
      const label   = resume.label || 'Resume';

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(label)}.pdf"`);

      const doc = buildPdfFromContent(content);
      doc.pipe(res);
      doc.end();
      return;
    }

    // Uploaded resume — serve the stored file
    if (!resume.storagePath || !fs.existsSync(resume.storagePath)) {
      return sendError(res, 'Resume file is missing from storage.', 404);
    }

    res.download(resume.storagePath, resume.fileName, (err) => {
      if (err && !res.headersSent) next(err);
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /employer/applicants/:id/email ───────────────────────────────────────

export const sendApplicantEmail = async (req, res, next) => {
  try {
    const { application, error } = await resolveApplication(req.params.id, req.user.id, req.user.role);
    if (error) return sendError(res, error.msg, error.code);

    const seeker = await User.findByPk(application.seekerId, { attributes: ['email', 'fullName'] });
    if (!seeker) return sendError(res, 'Seeker account not found.', 404);

    await sendEmployerEmail({
      to: seeker.email,
      seekerName: seeker.fullName,
      companyName: application.job.employer.companyName,
      jobTitle: application.job.title,
      subject: req.body.subject,
      message: req.body.message,
    });

    sendSuccess(res, null, 'Email sent successfully.');
  } catch (err) {
    next(err);
  }
};

// ── GET /employer/analytics/:jobId ────────────────────────────────────────────

export const getJobAnalytics = async (req, res, next) => {
  try {
    const employer = await EmployerProfile.findOne({ where: { userId: req.user.id } });
    if (!employer) return sendError(res, 'Company profile not found.', 404);

    const job = await JobListing.findOne({
      where: { id: req.params.jobId, employerId: employer.id },
      attributes: ['id', 'title', 'viewsCount', 'status', 'createdAt', 'expiresAt'],
    });
    if (!job) return sendError(res, 'Job not found or not authorised.', 404);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalApplications, stageFunnelRows, timelineRows] = await Promise.all([
      Application.count({ where: { jobId: job.id } }),

      // Count per ATS stage
      Application.findAll({
        where: { jobId: job.id },
        attributes: [
          'atsStage',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: ['atsStage'],
        raw: true,
      }),

      // Daily application counts over the last 30 days
      Application.findAll({
        where: {
          jobId: job.id,
          createdAt: { [Op.gte]: thirtyDaysAgo },
        },
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: [sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
        raw: true,
      }),
    ]);

    // Build a zero-filled funnel keyed by every possible stage
    const stageFunnel = Object.fromEntries(ATS_STAGES.map((s) => [s, 0]));
    stageFunnelRows.forEach(({ atsStage, count }) => {
      stageFunnel[atsStage] = parseInt(count, 10);
    });

    const conversionRate =
      job.viewsCount > 0
        ? parseFloat(((totalApplications / job.viewsCount) * 100).toFixed(2))
        : 0;

    sendSuccess(res, {
      job: {
        id: job.id,
        title: job.title,
        status: job.status,
        createdAt: job.createdAt,
        expiresAt: job.expiresAt,
      },
      views: job.viewsCount,
      totalApplications,
      conversionRate,
      stageFunnel,
      applicationTimeline: timelineRows.map(({ date, count }) => ({
        date,
        count: parseInt(count, 10),
      })),
    });
  } catch (err) {
    next(err);
  }
};
