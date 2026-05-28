import { Op } from 'sequelize';
import { JobListing, EmployerProfile, User, Application } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';

export const getAllJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, jobType, workMode, experienceLevel, location } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const where = { status: 'active' };

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (jobType) where.jobType = jobType;
    if (workMode) where.workMode = workMode;
    if (experienceLevel) where.experienceLevel = experienceLevel;
    if (location) where.location = { [Op.iLike]: `%${location}%` };

    const { count, rows: jobs } = await JobListing.findAndCountAll({
      where,
      include: [
        {
          model: EmployerProfile,
          as: 'employer',
          attributes: ['id', 'companyName', 'companySlug', 'logoUrl', 'industry'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset,
    });

    sendSuccess(res, {
      jobs,
      pagination: {
        total: count,
        page: parseInt(page, 10),
        pages: Math.ceil(count / parseInt(limit, 10)),
        limit: parseInt(limit, 10),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const job = await JobListing.findByPk(req.params.id, {
      include: [
        {
          model: EmployerProfile,
          as: 'employer',
          attributes: ['id', 'companyName', 'companySlug', 'logoUrl', 'websiteUrl', 'industry', 'companySize'],
          include: [{ model: User, as: 'user', attributes: ['id', 'email'] }],
        },
      ],
    });

    if (!job) return sendError(res, 'Job not found.', 404);

    await job.increment('viewsCount');
    sendSuccess(res, { job });
  } catch (err) {
    next(err);
  }
};

export const createJob = async (req, res, next) => {
  try {
    const employer = await EmployerProfile.findOne({ where: { userId: req.user.id } });
    if (!employer) return sendError(res, 'Create a company profile first.', 400);

    const job = await JobListing.create({ ...req.body, employerId: employer.id });
    sendSuccess(res, { job }, 'Job posted successfully.', 201);
  } catch (err) {
    next(err);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const job = await JobListing.findByPk(req.params.id, {
      include: [{ model: EmployerProfile, as: 'employer' }],
    });
    if (!job) return sendError(res, 'Job not found.', 404);
    if (job.employer.userId !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Not authorised.', 403);
    }
    await job.update(req.body);
    sendSuccess(res, { job });
  } catch (err) {
    next(err);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const job = await JobListing.findByPk(req.params.id, {
      include: [{ model: EmployerProfile, as: 'employer' }],
    });
    if (!job) return sendError(res, 'Job not found.', 404);
    if (job.employer.userId !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Not authorised.', 403);
    }
    await job.destroy();
    sendSuccess(res, null, 'Job deleted.');
  } catch (err) {
    next(err);
  }
};

export const getCompanyJobs = async (req, res, next) => {
  try {
    const employer = await EmployerProfile.findOne({ where: { userId: req.user.id } });
    if (!employer) return sendError(res, 'Company profile not found.', 404);

    const jobs = await JobListing.findAll({
      where: { employerId: employer.id },
      order: [['createdAt', 'DESC']],
    });
    sendSuccess(res, { jobs });
  } catch (err) {
    next(err);
  }
};
