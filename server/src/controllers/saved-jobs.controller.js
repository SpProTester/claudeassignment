import { SavedJob, JobListing, EmployerProfile } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';

// GET /api/seekers/saved-jobs
export const listSavedJobs = async (req, res, next) => {
  try {
    const saved = await SavedJob.findAll({
      where: { seekerId: req.user.id },
      include: [
        {
          model: JobListing,
          as: 'job',
          include: [
            {
              model: EmployerProfile,
              as: 'employer',
              attributes: ['id', 'companyName', 'companySlug', 'logoUrl', 'industry'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Filter out any saved entries where the job was hard-deleted
    const active = saved.filter((s) => s.job !== null);
    sendSuccess(res, { savedJobs: active });
  } catch (err) {
    next(err);
  }
};

// POST /api/seekers/saved-jobs/:jobId
export const saveJob = async (req, res, next) => {
  try {
    const job = await JobListing.findByPk(req.params.jobId);
    if (!job) return sendError(res, 'Job not found.', 404);

    const [saved, created] = await SavedJob.findOrCreate({
      where: { seekerId: req.user.id, jobId: req.params.jobId },
      defaults: { seekerId: req.user.id, jobId: req.params.jobId },
    });

    if (!created) return sendError(res, 'Job is already saved.', 409);
    sendSuccess(res, { savedJob: saved }, 'Job saved.', 201);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/seekers/saved-jobs/:jobId
export const unsaveJob = async (req, res, next) => {
  try {
    const deleted = await SavedJob.destroy({
      where: { seekerId: req.user.id, jobId: req.params.jobId },
    });

    if (!deleted) return sendError(res, 'Saved job not found.', 404);
    sendSuccess(res, null, 'Job removed from saved list.');
  } catch (err) {
    next(err);
  }
};
