import { Application, JobListing, EmployerProfile, User, Resume } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';
import { createNotification } from '../services/notification.service.js';
import { sendApplicationReceivedEmail } from '../utils/email.utils.js';

export const applyToJob = async (req, res, next) => {
  try {
    const job = await JobListing.findByPk(req.params.jobId);
    if (!job || job.status !== 'active') return sendError(res, 'Job not found or no longer active.', 404);

    const existing = await Application.findOne({
      where: { jobId: req.params.jobId, seekerId: req.user.id },
    });
    if (existing) return sendError(res, 'You have already applied to this job.', 409);

    // Resolve and validate the resume — a resume is required to apply.
    let resolvedResumeId = req.body.resumeId || null;

    if (resolvedResumeId) {
      // Caller specified a resume — verify ownership.
      const owned = await Resume.findOne({ where: { id: resolvedResumeId, seekerId: req.user.id } });
      if (!owned) return sendError(res, 'Invalid resume selection.', 400);
    } else {
      // No resume specified — try default, then any.
      const resume = await Resume.findOne({
        where: { seekerId: req.user.id },
        order: [['isDefault', 'DESC'], ['createdAt', 'DESC']],
      });
      if (!resume) {
        return sendError(res, 'Please upload your resume before applying for jobs.', 400);
      }
      resolvedResumeId = resume.id;
    }

    const application = await Application.create({
      jobId: req.params.jobId,
      seekerId: req.user.id,
      coverLetter: req.body.coverLetter,
      resumeId: resolvedResumeId,
    });

    // Notify employer about the new application (fire-and-forget)
    EmployerProfile.findByPk(job.employerId, { attributes: ['userId', 'companyName'] })
      .then(async (employer) => {
        if (!employer) return;
        const employerUser = await User.findByPk(employer.userId, { attributes: ['email', 'fullName'] });
        if (!employerUser) return;
        return createNotification(employer.userId, 'application_update', {
          title: 'New Application Received',
          body: `${req.user.fullName} applied for ${job.title}`,
          metadata: { applicationId: application.id, jobId: job.id, seekerId: req.user.id },
          email: () => sendApplicationReceivedEmail({
            to: employerUser.email,
            companyName: employer.companyName,
            seekerName: req.user.fullName,
            jobTitle: job.title,
            applicationId: application.id,
          }),
        });
      })
      .catch((err) => console.error('[apply] Employer notification failed:', err.message));

    sendSuccess(res, { application }, 'Application submitted.', 201);
  } catch (err) {
    next(err);
  }
};

export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.findAll({
      where: { seekerId: req.user.id },
      include: [
        {
          model: JobListing,
          as: 'job',
          include: [
            {
              model: EmployerProfile,
              as: 'employer',
              attributes: ['id', 'companyName', 'companySlug', 'logoUrl'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    sendSuccess(res, { applications });
  } catch (err) {
    next(err);
  }
};

export const getJobApplications = async (req, res, next) => {
  try {
    const job = await JobListing.findByPk(req.params.jobId, {
      include: [{ model: EmployerProfile, as: 'employer' }],
    });
    if (!job) return sendError(res, 'Job not found.', 404);
    if (job.employer.userId !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Not authorised.', 403);
    }

    const applications = await Application.findAll({
      where: { jobId: req.params.jobId },
      include: [
        { model: User, as: 'seeker', attributes: ['id', 'fullName', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    sendSuccess(res, { applications });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/applications/:id  — seeker withdraws their own application
export const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) return sendError(res, 'Application not found.', 404);
    if (application.seekerId !== req.user.id) return sendError(res, 'Not authorised.', 403);

    const locked = ['hired', 'rejected'];
    if (locked.includes(application.atsStage)) {
      return sendError(res, `Cannot withdraw an application that has been ${application.atsStage}.`, 409);
    }

    await application.destroy();
    sendSuccess(res, null, 'Application withdrawn successfully.');
  } catch (err) {
    next(err);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const application = await Application.findByPk(req.params.id, {
      include: [{ model: JobListing, as: 'job', include: [{ model: EmployerProfile, as: 'employer' }] }],
    });
    if (!application) return sendError(res, 'Application not found.', 404);
    if (application.job.employer.userId !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Not authorised.', 403);
    }

    const { atsStage, employerRating, employerNotes } = req.body;
    await application.update({ atsStage, employerRating, employerNotes });
    sendSuccess(res, { application }, 'Application updated.');
  } catch (err) {
    next(err);
  }
};
