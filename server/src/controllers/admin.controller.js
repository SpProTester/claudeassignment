import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import {
  sequelize,
  User,
  JobListing,
  Application,
  EmployerProfile,
  SeekerProfile,
  JobCategory,
  AuditLog,
  SearchLog,
  Notification,
  BillingEvent,
} from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';

// ─── helpers ──────────────────────────────────────────────────────────────

const audit = (adminId, action, entityType, entityId, details, req) =>
  AuditLog.create({
    adminId,
    action,
    entityType,
    entityId: entityId || null,
    details: details || {},
    ipAddress: req?.ip,
    userAgent: req?.get('user-agent'),
  }).catch(() => {}); // non-blocking, never throw

const paginate = (page, limit) => ({
  limit: parseInt(limit, 10),
  offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
});

// ─── Platform Stats ────────────────────────────────────────────────────────

export const getStats = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const [
      totalUsers, activeJobs, appsToday, newUsersToday,
      registrationsTrend, topCategories,
      totalJobs, expiredJobs, totalApplications,
      activeSubscriptions, expiredSubscriptions,
      totalRevenue, recentActivities,
    ] = await Promise.all([
      User.findAll({
        attributes: ['role', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['role'],
        raw: true,
      }),
      JobListing.count({ where: { status: 'active' } }),
      Application.count({ where: { createdAt: { [Op.gte]: today } } }),
      User.count({ where: { createdAt: { [Op.gte]: today } } }),
      User.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        where: { createdAt: { [Op.gte]: thirtyDaysAgo } },
        group: [sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
        raw: true,
      }),
      JobCategory.findAll({
        attributes: ['id', 'name', [sequelize.fn('COUNT', sequelize.col('jobs.id')), 'jobCount']],
        include: [{ model: JobListing, as: 'jobs', attributes: [], where: { status: 'active' }, required: false }],
        group: ['JobCategory.id'],
        order: [[sequelize.literal('"jobCount"'), 'DESC']],
        limit: 10,
        subQuery: false,
      }),
      JobListing.count(),
      JobListing.count({ where: { status: 'expired' } }),
      Application.count(),
      EmployerProfile.count({ where: { subscriptionStatus: 'active' } }),
      EmployerProfile.count({ where: { subscriptionStatus: 'canceled' } }),
      BillingEvent.sum('amount', { where: { status: 'paid' } }),
      AuditLog.findAll({
        include: [{ model: User, as: 'admin', attributes: ['id', 'fullName', 'email'] }],
        order: [['createdAt', 'DESC']],
        limit: 10,
      }),
    ]);

    const usersByRole = { seeker: 0, employer: 0, admin: 0 };
    let totalUserCount = 0;
    totalUsers.forEach((r) => {
      usersByRole[r.role] = parseInt(r.count, 10);
      totalUserCount += parseInt(r.count, 10);
    });

    sendSuccess(res, {
      users: { total: totalUserCount, ...usersByRole, newToday: newUsersToday },
      jobs: { active: activeJobs, total: totalJobs, expired: expiredJobs },
      applications: { today: appsToday, total: totalApplications },
      subscriptions: { active: activeSubscriptions, expired: expiredSubscriptions },
      revenue: { total: totalRevenue || 0 },
      registrationsTrend: registrationsTrend.map((r) => ({ date: r.date, count: parseInt(r.count, 10) })),
      topCategories,
      recentActivities,
    });
  } catch (err) {
    next(err);
  }
};

// ─── User Management ──────────────────────────────────────────────────────

export const getUsers = async (req, res, next) => {
  try {
    const { q, role, status, page = 1, limit = 20 } = req.query;
    const where = {};

    if (q) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${q}%` } },
        { fullName: { [Op.iLike]: `%${q}%` } },
      ];
    }
    if (role) where.role = role;
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;

    const { limit: lim, offset } = paginate(page, limit);
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['passwordHash', 'refreshToken', 'passwordResetOtp', 'passwordResetOtpExpiry'] },
      include: [
        { model: SeekerProfile, as: 'seekerProfile', attributes: ['id', 'headline'], required: false },
        { model: EmployerProfile, as: 'employerProfile', attributes: ['id', 'companyName', 'subscriptionPlan'], required: false },
      ],
      order: [['createdAt', 'DESC']],
      limit: lim,
      offset,
    });

    sendSuccess(res, {
      users: rows,
      pagination: { page: parseInt(page, 10), limit: lim, total: count, totalPages: Math.ceil(count / lim) },
    });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['passwordHash', 'refreshToken', 'passwordResetOtp', 'passwordResetOtpExpiry'] },
      include: [
        { model: SeekerProfile, as: 'seekerProfile', required: false },
        { model: EmployerProfile, as: 'employerProfile', required: false },
      ],
    });
    if (!user) return sendError(res, 'User not found.', 404);

    const [totalApplications, totalJobs] = await Promise.all([
      user.role === 'seeker'
        ? Application.count({ where: { seekerId: user.id } })
        : Promise.resolve(0),
      user.role === 'employer'
        ? JobListing.count({ where: { employerId: user.employerProfile?.id } })
        : Promise.resolve(0),
    ]);

    sendSuccess(res, { user, stats: { totalApplications, totalJobs } });
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    if (id === req.user.id) return sendError(res, 'You cannot deactivate your own account.', 403);

    const user = await User.findByPk(id);
    if (!user) return sendError(res, 'User not found.', 404);

    const prev = user.isActive;
    await user.update({ isActive });

    if (!isActive) await user.update({ refreshToken: null });

    await audit(req.user.id, isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED', 'user', id, { previousStatus: prev }, req);
    sendSuccess(res, { user: { id: user.id, isActive: user.isActive } });
  } catch (err) {
    next(err);
  }
};

// ─── Employer Management ───────────────────────────────────────────────────

export const getEmployers = async (req, res, next) => {
  try {
    const { q, subscriptionPlan, subscriptionStatus, isVerified, page = 1, limit = 20 } = req.query;
    const where = {};

    if (q) where.companyName = { [Op.iLike]: `%${q}%` };
    if (subscriptionPlan) where.subscriptionPlan = subscriptionPlan;
    if (subscriptionStatus) where.subscriptionStatus = subscriptionStatus;
    if (isVerified !== undefined && isVerified !== '') where.isVerified = isVerified === 'true';

    const { limit: lim, offset } = paginate(page, limit);
    const { count, rows } = await EmployerProfile.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email', 'isActive', 'createdAt'],
        },
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(SELECT COUNT(*) FROM job_listings WHERE job_listings.employer_id = "EmployerProfile"."id")`),
            'jobCount',
          ],
          [
            sequelize.literal(`(SELECT COUNT(*) FROM job_listings WHERE job_listings.employer_id = "EmployerProfile"."id" AND job_listings.status = 'active')`),
            'activeJobCount',
          ],
        ],
      },
      order: [['createdAt', 'DESC']],
      limit: lim,
      offset,
    });

    sendSuccess(res, {
      employers: rows,
      pagination: { page: parseInt(page, 10), limit: lim, total: count, totalPages: Math.ceil(count / lim) },
    });
  } catch (err) {
    next(err);
  }
};

export const getEmployerById = async (req, res, next) => {
  try {
    const employer = await EmployerProfile.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['passwordHash', 'refreshToken', 'passwordResetOtp', 'passwordResetOtpExpiry'] },
        },
      ],
      attributes: {
        include: [
          [sequelize.literal(`(SELECT COUNT(*) FROM job_listings WHERE job_listings.employer_id = "EmployerProfile"."id")`), 'jobCount'],
          [sequelize.literal(`(SELECT COUNT(*) FROM job_listings WHERE job_listings.employer_id = "EmployerProfile"."id" AND job_listings.status = 'active')`), 'activeJobCount'],
          [sequelize.literal(`(SELECT COUNT(DISTINCT a.id) FROM applications a INNER JOIN job_listings j ON a.job_id = j.id WHERE j.employer_id = "EmployerProfile"."id")`), 'totalApplications'],
        ],
      },
    });
    if (!employer) return sendError(res, 'Employer not found.', 404);

    const [recentJobs, billingHistory] = await Promise.all([
      JobListing.findAll({
        where: { employerId: employer.id },
        attributes: ['id', 'title', 'status', 'jobType', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit: 10,
      }),
      BillingEvent.findAll({
        where: { employerId: employer.id },
        order: [['createdAt', 'DESC']],
        limit: 10,
      }),
    ]);

    sendSuccess(res, { employer, recentJobs, billingHistory });
  } catch (err) {
    next(err);
  }
};

export const verifyEmployer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const employer = await EmployerProfile.findByPk(id);
    if (!employer) return sendError(res, 'Employer not found.', 404);

    await employer.update({ isVerified });
    await audit(req.user.id, isVerified ? 'EMPLOYER_VERIFIED' : 'EMPLOYER_UNVERIFIED', 'employer', id, { companyName: employer.companyName }, req);
    sendSuccess(res, { employer: { id: employer.id, isVerified: employer.isVerified } });
  } catch (err) {
    next(err);
  }
};

export const assignEmployerPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subscriptionPlan, subscriptionStatus } = req.body;

    const employer = await EmployerProfile.findByPk(id);
    if (!employer) return sendError(res, 'Employer not found.', 404);

    const updates = {};
    if (subscriptionPlan) updates.subscriptionPlan = subscriptionPlan;
    if (subscriptionStatus) updates.subscriptionStatus = subscriptionStatus;

    await employer.update(updates);
    await audit(req.user.id, 'EMPLOYER_PLAN_UPDATED', 'employer', id, { subscriptionPlan, subscriptionStatus }, req);
    sendSuccess(res, { employer: { id: employer.id, subscriptionPlan: employer.subscriptionPlan, subscriptionStatus: employer.subscriptionStatus } });
  } catch (err) {
    next(err);
  }
};

// ─── Job Moderation ────────────────────────────────────────────────────────

export const getJobs = async (req, res, next) => {
  try {
    const { q, status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (q) where.title = { [Op.iLike]: `%${q}%` };
    if (status) where.status = status;

    const { limit: lim, offset } = paginate(page, limit);
    const { count, rows } = await JobListing.findAndCountAll({
      where,
      include: [{ model: EmployerProfile, as: 'employer', attributes: ['companyName', 'subscriptionPlan'] }],
      order: [['createdAt', 'DESC']],
      limit: lim,
      offset,
    });

    sendSuccess(res, {
      jobs: rows,
      pagination: { page: parseInt(page, 10), limit: lim, total: count, totalPages: Math.ceil(count / lim) },
    });
  } catch (err) {
    next(err);
  }
};

export const moderateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'close' | 'activate' | 'draft'

    const validActions = { close: 'closed', activate: 'active', draft: 'draft' };
    if (!validActions[action]) return sendError(res, 'Invalid action. Use: close, activate, draft.', 400);

    const job = await JobListing.findByPk(id);
    if (!job) return sendError(res, 'Job not found.', 404);

    const prev = job.status;
    await job.update({ status: validActions[action] });

    await audit(req.user.id, `JOB_${action.toUpperCase()}`, 'job', id, { previousStatus: prev, newStatus: validActions[action] }, req);
    sendSuccess(res, { job: { id: job.id, status: job.status } });
  } catch (err) {
    next(err);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const job = await JobListing.findByPk(req.params.id);
    if (!job) return sendError(res, 'Job not found.', 404);

    await audit(req.user.id, 'JOB_DELETED', 'job', job.id, { title: job.title }, req);
    await job.destroy();
    sendSuccess(res, null, 'Job listing permanently removed.');
  } catch (err) {
    next(err);
  }
};

// ─── Application Management ───────────────────────────────────────────────

export const getApplications = async (req, res, next) => {
  try {
    const { seekerId, jobId, atsStage, employerSearch, page = 1, limit = 20 } = req.query;
    const where = {};

    if (seekerId) where.seekerId = seekerId;
    if (jobId) where.jobId = jobId;
    if (atsStage) where.atsStage = atsStage;

    const { limit: lim, offset } = paginate(page, limit);
    const { count, rows } = await Application.findAndCountAll({
      where,
      include: [
        { model: User, as: 'seeker', attributes: ['id', 'fullName', 'email'] },
        {
          model: JobListing,
          as: 'job',
          attributes: ['id', 'title', 'slug', 'jobType', 'status'],
          include: [{ model: EmployerProfile, as: 'employer', attributes: ['id', 'companyName'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: lim,
      offset,
    });

    sendSuccess(res, {
      applications: rows,
      pagination: { page: parseInt(page, 10), limit: lim, total: count, totalPages: Math.ceil(count / lim) },
    });
  } catch (err) {
    next(err);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { atsStage } = req.body;

    const app = await Application.findByPk(id);
    if (!app) return sendError(res, 'Application not found.', 404);

    const prev = app.atsStage;
    await app.update({ atsStage });
    await audit(req.user.id, 'APPLICATION_STAGE_UPDATED', 'application', id, { from: prev, to: atsStage }, req);
    sendSuccess(res, { application: { id: app.id, atsStage: app.atsStage } });
  } catch (err) {
    next(err);
  }
};

// ─── Subscription Monitoring ──────────────────────────────────────────────

export const getSubscriptions = async (req, res, next) => {
  try {
    const { subscriptionStatus, subscriptionPlan, page = 1, limit = 20 } = req.query;
    const where = {};

    if (subscriptionStatus) where.subscriptionStatus = subscriptionStatus;
    if (subscriptionPlan) where.subscriptionPlan = subscriptionPlan;

    const { limit: lim, offset } = paginate(page, limit);
    const { count, rows } = await EmployerProfile.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'isActive'] }],
      attributes: ['id', 'companyName', 'subscriptionPlan', 'subscriptionStatus', 'subscriptionCurrentPeriodEnd', 'stripeSubscriptionId', 'isVerified', 'createdAt'],
      order: [['subscriptionCurrentPeriodEnd', 'DESC NULLS LAST']],
      limit: lim,
      offset,
    });

    sendSuccess(res, {
      subscriptions: rows,
      pagination: { page: parseInt(page, 10), limit: lim, total: count, totalPages: Math.ceil(count / lim) },
    });
  } catch (err) {
    next(err);
  }
};

export const getPayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const { limit: lim, offset } = paginate(page, limit);
    const { count, rows } = await BillingEvent.findAndCountAll({
      where,
      include: [
        {
          model: EmployerProfile,
          as: 'employer',
          attributes: ['id', 'companyName', 'subscriptionPlan'],
          include: [{ model: User, as: 'user', attributes: ['fullName', 'email'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: lim,
      offset,
    });

    sendSuccess(res, {
      payments: rows,
      pagination: { page: parseInt(page, 10), limit: lim, total: count, totalPages: Math.ceil(count / lim) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Reports ──────────────────────────────────────────────────────────────

export const getReports = async (req, res, next) => {
  try {
    const { type = 'users', days = 30 } = req.query;
    const since = new Date(Date.now() - parseInt(days, 10) * 24 * 60 * 60 * 1000);

    let data = [];

    if (type === 'jobs') {
      data = await JobListing.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        where: { createdAt: { [Op.gte]: since } },
        group: [sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
        raw: true,
      });
    } else if (type === 'applications') {
      data = await Application.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        where: { createdAt: { [Op.gte]: since } },
        group: [sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
        raw: true,
      });
    } else if (type === 'revenue') {
      data = await BillingEvent.findAll({
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'month'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        where: { status: 'paid', createdAt: { [Op.gte]: since } },
        group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'ASC']],
        raw: true,
      });
    } else {
      // users (default)
      data = await User.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        where: { createdAt: { [Op.gte]: since } },
        group: [sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
        raw: true,
      });
    }

    sendSuccess(res, {
      data: data.map((r) => ({ ...r, count: parseInt(r.count, 10) })),
      type,
      days: parseInt(days, 10),
    });
  } catch (err) {
    next(err);
  }
};

// ─── Categories ────────────────────────────────────────────────────────────

export const getCategories = async (req, res, next) => {
  try {
    const categories = await JobCategory.findAll({ order: [['name', 'ASC']] });
    sendSuccess(res, { categories });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) return sendError(res, 'Name and slug are required.', 400);
    const category = await JobCategory.create({ name, slug });
    await audit(req.user.id, 'CATEGORY_CREATED', 'category', category.id, { name }, req);
    sendSuccess(res, { category }, 'Category created.', 201);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await JobCategory.findByPk(req.params.id);
    if (!category) return sendError(res, 'Category not found.', 404);
    await category.update(req.body);
    await audit(req.user.id, 'CATEGORY_UPDATED', 'category', category.id, req.body, req);
    sendSuccess(res, { category });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await JobCategory.findByPk(req.params.id);
    if (!category) return sendError(res, 'Category not found.', 404);
    await audit(req.user.id, 'CATEGORY_DELETED', 'category', category.id, { name: category.name }, req);
    await category.destroy();
    sendSuccess(res, null, 'Category deleted.');
  } catch (err) {
    next(err);
  }
};

// ─── Admin User Management ────────────────────────────────────────────────

export const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      where: { role: 'admin' },
      attributes: { exclude: ['passwordHash', 'refreshToken', 'passwordResetOtp', 'passwordResetOtpExpiry'] },
      order: [['createdAt', 'ASC']],
    });
    sendSuccess(res, { users });
  } catch (err) {
    next(err);
  }
};

export const createAdminUser = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) return sendError(res, 'fullName, email, and password are required.', 400);

    const existing = await User.findOne({ where: { email } });
    if (existing) return sendError(res, 'Email already in use.', 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ fullName, email, passwordHash, role: 'admin', isActive: true, isVerified: true });
    await audit(req.user.id, 'ADMIN_USER_CREATED', 'user', user.id, { email, fullName }, req);
    sendSuccess(
      res,
      { user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, isActive: user.isActive, createdAt: user.createdAt } },
      'Admin user created.',
      201
    );
  } catch (err) {
    next(err);
  }
};

// ─── Audit Log ────────────────────────────────────────────────────────────

export const getAuditLog = async (req, res, next) => {
  try {
    const { action, entityType, page = 1, limit = 50 } = req.query;
    const where = {};
    if (action) where.action = { [Op.iLike]: `%${action}%` };
    if (entityType) where.entityType = entityType;

    const { limit: lim, offset } = paginate(page, limit);
    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      include: [{ model: User, as: 'admin', attributes: ['id', 'fullName', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: lim,
      offset,
    });

    sendSuccess(res, {
      logs: rows,
      pagination: { page: parseInt(page, 10), limit: lim, total: count, totalPages: Math.ceil(count / lim) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Search Analytics ─────────────────────────────────────────────────────

export const getSearchTrends = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days || '7', 10);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const topKeywords = await SearchLog.findAll({
      attributes: ['keyword', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where: { searchedAt: { [Op.gte]: since }, keyword: { [Op.ne]: null } },
      group: ['keyword'],
      order: [[sequelize.literal('"count"'), 'DESC']],
      limit: 10,
      raw: true,
    });

    sendSuccess(res, { topKeywords, zeroResults: [] });
  } catch (err) {
    next(err);
  }
};

// ─── Broadcast Notification ───────────────────────────────────────────────

export const broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, targetRole } = req.body;
    if (!title || !message) return sendError(res, 'Title and message are required.', 400);

    const where = targetRole ? { role: targetRole } : {};
    const users = await User.findAll({ where, attributes: ['id'] });

    await Notification.bulkCreate(
      users.map((u) => ({ userId: u.id, type: 'SYSTEM', title, message }))
    );

    await audit(req.user.id, 'BROADCAST_SENT', 'system', null, { title, targetRole, count: users.length }, req);
    sendSuccess(res, { notifiedCount: users.length });
  } catch (err) {
    next(err);
  }
};
