import { Op } from 'sequelize';
import { Job, Company, User, Application } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';

export const getAllJobs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      jobType,
      experienceLevel,
      location,
      category,
    } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const where = { isActive: true };

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (jobType) where.jobType = jobType;
    if (experienceLevel) where.experienceLevel = experienceLevel;
    if (location) where.location = { [Op.iLike]: `%${location}%` };
    if (category) where.category = category;

    const { count, rows: jobs } = await Job.findAndCountAll({
      where,
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'logoUrl', 'location', 'industry'],
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
    const job = await Job.findByPk(req.params.id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'logoUrl', 'website', 'description', 'location', 'industry', 'companySize'],
          include: [{ model: User, as: 'owner', attributes: ['id', 'email'] }],
        },
      ],
    });

    if (!job) return sendError(res, 'Job not found.', 404);
    sendSuccess(res, { job });
  } catch (err) {
    next(err);
  }
};

export const createJob = async (req, res, next) => {
  try {
    const company = await Company.findOne({ where: { userId: req.user.id } });
    if (!company) return sendError(res, 'Create a company profile first.', 400);

    const job = await Job.create({ ...req.body, companyId: company.id });
    sendSuccess(res, { job }, 'Job posted successfully.', 201);
  } catch (err) {
    next(err);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [{ model: Company, as: 'company' }],
    });
    if (!job) return sendError(res, 'Job not found.', 404);
    if (job.company.userId !== req.user.id && req.user.role !== 'admin') {
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
    const job = await Job.findByPk(req.params.id, {
      include: [{ model: Company, as: 'company' }],
    });
    if (!job) return sendError(res, 'Job not found.', 404);
    if (job.company.userId !== req.user.id && req.user.role !== 'admin') {
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
    const company = await Company.findOne({ where: { userId: req.user.id } });
    if (!company) return sendError(res, 'Company profile not found.', 404);

    const jobs = await Job.findAll({
      where: { companyId: company.id },
      order: [['createdAt', 'DESC']],
    });
    sendSuccess(res, { jobs });
  } catch (err) {
    next(err);
  }
};
