import { EmployerProfile } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';

export const getAllCompanies = async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const { count, rows: companies } = await EmployerProfile.findAndCountAll({
      attributes: ['id', 'companyName', 'companySlug', 'logoUrl', 'industry', 'companySize', 'isVerified'],
      order: [['companyName', 'ASC']],
      limit: parseInt(limit, 10),
      offset,
    });

    sendSuccess(res, {
      companies,
      pagination: {
        total: count,
        page: parseInt(page, 10),
        pages: Math.ceil(count / parseInt(limit, 10)),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getCompanyById = async (req, res, next) => {
  try {
    const company = await EmployerProfile.findByPk(req.params.id);
    if (!company) return sendError(res, 'Company not found.', 404);
    sendSuccess(res, { company });
  } catch (err) {
    next(err);
  }
};

export const createCompany = async (req, res, next) => {
  try {
    const existing = await EmployerProfile.findOne({ where: { userId: req.user.id } });
    if (existing) return sendError(res, 'You already have a company profile.', 409);

    const company = await EmployerProfile.create({ ...req.body, userId: req.user.id });
    sendSuccess(res, { company }, 'Company created.', 201);
  } catch (err) {
    next(err);
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const company = await EmployerProfile.findByPk(req.params.id);
    if (!company) return sendError(res, 'Company not found.', 404);
    if (company.userId !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Not authorised.', 403);
    }
    await company.update(req.body);
    sendSuccess(res, { company });
  } catch (err) {
    next(err);
  }
};

export const getMyCompany = async (req, res, next) => {
  try {
    const company = await EmployerProfile.findOne({ where: { userId: req.user.id } });
    if (!company) return sendError(res, 'No company profile found.', 404);
    sendSuccess(res, { company });
  } catch (err) {
    next(err);
  }
};
