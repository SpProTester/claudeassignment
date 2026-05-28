import { Application, Job, Company, User } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';

export const applyToJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.jobId);
    if (!job || !job.isActive) return sendError(res, 'Job not found or no longer active.', 404);

    const existing = await Application.findOne({
      where: { jobId: req.params.jobId, userId: req.user.id },
    });
    if (existing) return sendError(res, 'You have already applied to this job.', 409);

    const application = await Application.create({
      jobId: req.params.jobId,
      userId: req.user.id,
      coverLetter: req.body.coverLetter,
      resumeUrl: req.body.resumeUrl,
    });

    sendSuccess(res, { application }, 'Application submitted.', 201);
  } catch (err) {
    next(err);
  }
};

export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Job,
          as: 'job',
          include: [
            {
              model: Company,
              as: 'company',
              attributes: ['id', 'name', 'logoUrl', 'location'],
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
    const job = await Job.findByPk(req.params.jobId, {
      include: [{ model: Company, as: 'company' }],
    });
    if (!job) return sendError(res, 'Job not found.', 404);
    if (job.company.userId !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Not authorised.', 403);
    }

    const applications = await Application.findAll({
      where: { jobId: req.params.jobId },
      include: [
        { model: User, as: 'applicant', attributes: ['id', 'firstName', 'lastName', 'email', 'avatarUrl'] },
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
      include: [{ model: Job, as: 'job', include: [{ model: Company, as: 'company' }] }],
    });
    if (!application) return sendError(res, 'Application not found.', 404);
    if (application.job.company.userId !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Not authorised.', 403);
    }

    const { status, employerNotes } = req.body;
    await application.update({ status, employerNotes });
    sendSuccess(res, { application }, 'Application status updated.');
  } catch (err) {
    next(err);
  }
};
