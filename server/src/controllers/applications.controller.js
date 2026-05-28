import { Application, JobListing, EmployerProfile, User } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';

export const applyToJob = async (req, res, next) => {
  try {
    const job = await JobListing.findByPk(req.params.jobId);
    if (!job || job.status !== 'active') return sendError(res, 'Job not found or no longer active.', 404);

    const existing = await Application.findOne({
      where: { jobId: req.params.jobId, seekerId: req.user.id },
    });
    if (existing) return sendError(res, 'You have already applied to this job.', 409);

    const application = await Application.create({
      jobId: req.params.jobId,
      seekerId: req.user.id,
      coverLetter: req.body.coverLetter,
      resumeId: req.body.resumeId || null,
    });

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
