import { Op } from 'sequelize';
import { sequelize, JobListing, EmployerProfile, Application, Skill } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';

// Active job limits per plan — Infinity means unlimited.
// Legacy plan names (free/basic/premium) are kept for backward compatibility.
const PLAN_QUOTAS = {
  free: 5,
  starter: 5,
  basic: 20,
  professional: 20,
  premium: Infinity,
  business: Infinity,
};

// Countable statuses — a job occupies a quota slot until closed/expired
const QUOTA_STATUSES = ['draft', 'active', 'paused'];

const toSlug = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

const resolveSkillNames = async (names) => {
  if (!names?.length) return [];
  return Promise.all(
    names.map(async (raw) => {
      const name = String(raw).trim().slice(0, 100);
      if (!name) return null;
      const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const [skill] = await Skill.findOrCreate({
        where: { name },
        defaults: { name, slug: `${baseSlug}-${Date.now().toString(36).slice(-5)}` },
      });
      return skill;
    })
  ).then((skills) => skills.filter(Boolean));
};

const generateUniqueSlug = async (title, companyName) => {
  const base = toSlug(`${title} ${companyName}`);
  let slug = base;
  for (let attempt = 0; attempt < 6; attempt++) {
    const exists = await JobListing.findOne({ where: { slug }, attributes: ['id'] });
    if (!exists) return slug;
    slug = `${base}-${Math.random().toString(36).slice(2, 7)}`;
  }
  throw new Error('Could not generate a unique job slug. Please try again.');
};

// Resolve the employer profile for the authenticated user (admin may impersonate via body)
const resolveEmployer = async (userId) => EmployerProfile.findOne({ where: { userId } });

// GET /api/employer/jobs/stats
export const getEmployerJobStats = async (req, res, next) => {
  try {
    const employer = await resolveEmployer(req.user.id);
    if (!employer) return sendError(res, 'Company profile not found.', 404);

    const [row] = await sequelize.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'active')::INT  AS "activeJobs",
         COUNT(*) FILTER (WHERE status = 'draft')::INT   AS "draftJobs",
         COUNT(*) FILTER (WHERE status = 'paused')::INT  AS "pausedJobs",
         COUNT(*) FILTER (WHERE status = 'closed')::INT  AS "closedJobs",
         COUNT(*) FILTER (WHERE status = 'expired')::INT AS "expiredJobs",
         COALESCE(SUM(views_count), 0)::INT              AS "totalViews",
         (
           SELECT COALESCE(COUNT(*), 0)::INT
           FROM applications a
           JOIN job_listings j ON j.id = a.job_id
           WHERE j.employer_id = :eid
         ) AS "totalApplicants"
       FROM job_listings
       WHERE employer_id = :eid`,
      { replacements: { eid: employer.id }, type: sequelize.QueryTypes.SELECT }
    );

    sendSuccess(res, { stats: row ?? {} });
  } catch (err) {
    next(err);
  }
};

// POST /api/employer/jobs
export const createEmployerJob = async (req, res, next) => {
  try {
    const employer = await resolveEmployer(req.user.id);
    if (!employer) return sendError(res, 'Create a company profile before posting jobs.', 400);

    // Quota enforcement
    const quota = PLAN_QUOTAS[employer.subscriptionPlan] ?? PLAN_QUOTAS.free;
    if (isFinite(quota)) {
      const activeCount = await JobListing.count({
        where: { employerId: employer.id, status: { [Op.in]: QUOTA_STATUSES } },
      });
      if (activeCount >= quota) {
        return sendError(
          res,
          `Job posting limit reached (${quota} jobs on the ${employer.subscriptionPlan} plan). Upgrade your plan to post more.`,
          403
        );
      }
    }

    const slug = await generateUniqueSlug(req.body.title, employer.companyName);
    const { skillIds, skillNames, requirements, benefits, ...jobData } = req.body;

    const job = await JobListing.create({
      ...jobData,
      requirements: requirements ?? null,
      benefits: benefits ?? null,
      employerId: employer.id,
      slug,
    });

    const skillInstances = await resolveSkillNames(skillNames);
    if (skillInstances.length) {
      await job.setSkills(skillInstances);
    } else if (skillIds?.length) {
      await job.setSkills(skillIds);
    }

    const result = await JobListing.findByPk(job.id, {
      include: [
        { model: EmployerProfile, as: 'employer', attributes: ['id', 'companyName', 'companySlug', 'logoUrl'] },
        { model: Skill, as: 'skills', through: { attributes: ['isRequired'] } },
      ],
    });
    sendSuccess(res, { job: result }, 'Job posted successfully.', 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/employer/jobs
export const listEmployerJobs = async (req, res, next) => {
  try {
    const employer = await resolveEmployer(req.user.id);
    if (!employer) return sendError(res, 'Company profile not found.', 404);

    const { page = 1, limit = 10, status } = req.query;
    const parsedPage = Math.max(1, parseInt(page, 10));
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (parsedPage - 1) * parsedLimit;

    const where = { employerId: employer.id };
    if (status) where.status = status;

    const { count, rows: jobs } = await JobListing.findAndCountAll({
      where,
      attributes: {
        include: [
          // Inline subquery avoids GROUP BY + pagination complexity
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM applications WHERE applications.job_id = "JobListing".id)'
            ),
            'applicationsCount',
          ],
        ],
      },
      order: [['createdAt', 'DESC']],
      limit: parsedLimit,
      offset,
      distinct: true,
    });

    sendSuccess(res, {
      jobs,
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

// GET /api/employer/jobs/:id
export const getEmployerJob = async (req, res, next) => {
  try {
    const employer = await resolveEmployer(req.user.id);
    if (!employer) return sendError(res, 'Company profile not found.', 404);

    const job = await JobListing.findOne({
      where: { id: req.params.id, employerId: employer.id },
      include: [
        {
          model: EmployerProfile,
          as: 'employer',
          attributes: ['id', 'companyName', 'companySlug', 'logoUrl', 'websiteUrl', 'industry'],
        },
        { model: Skill, as: 'skills', through: { attributes: ['isRequired'] } },
        {
          model: Application,
          as: 'applications',
          attributes: ['id', 'atsStage', 'createdAt'],
        },
      ],
      attributes: {
        include: [
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM applications WHERE applications.job_id = "JobListing".id)'
            ),
            'applicationsCount',
          ],
        ],
      },
    });

    if (!job) return sendError(res, 'Job not found.', 404);
    sendSuccess(res, { job });
  } catch (err) {
    next(err);
  }
};

// PUT /api/employer/jobs/:id
export const updateEmployerJob = async (req, res, next) => {
  try {
    const employer = await resolveEmployer(req.user.id);
    if (!employer) return sendError(res, 'Company profile not found.', 404);

    const job = await JobListing.findOne({
      where: { id: req.params.id, employerId: employer.id },
    });
    if (!job) return sendError(res, 'Job not found or not authorised.', 404);

    // Strip fields that must never be set externally
    const { skillIds, skillNames, slug: _s, employerId: _e, ...updates } = req.body;

    // Only allow safe status transitions via the form (not expired — that requires explicit renewal)
    const FORM_STATUSES = ['draft', 'active', 'paused'];
    if (updates.status && !FORM_STATUSES.includes(updates.status)) {
      delete updates.status;
    }

    // Normalise optional text fields
    if ('requirements' in updates) updates.requirements = updates.requirements || null;
    if ('benefits' in updates) updates.benefits = updates.benefits || null;

    // Regenerate slug only when the title actually changes
    if (updates.title && updates.title !== job.title) {
      updates.slug = await generateUniqueSlug(updates.title, employer.companyName);
    }

    await job.update(updates);

    if (skillNames !== undefined) {
      const skillInstances = await resolveSkillNames(skillNames);
      await job.setSkills(skillInstances);
    } else if (skillIds !== undefined) {
      await job.setSkills(skillIds ?? []);
    }

    const result = await JobListing.findByPk(job.id, {
      include: [
        { model: EmployerProfile, as: 'employer', attributes: ['id', 'companyName', 'companySlug', 'logoUrl'] },
        { model: Skill, as: 'skills', through: { attributes: ['isRequired'] } },
      ],
    });
    sendSuccess(res, { job: result });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/employer/jobs/:id  — soft delete (set status = 'closed')
export const softDeleteJob = async (req, res, next) => {
  try {
    const employer = await resolveEmployer(req.user.id);
    if (!employer) return sendError(res, 'Company profile not found.', 404);

    const job = await JobListing.findOne({
      where: { id: req.params.id, employerId: employer.id },
    });
    if (!job) return sendError(res, 'Job not found or not authorised.', 404);

    if (job.status === 'closed') {
      return sendError(res, 'Job is already closed.', 409);
    }

    await job.update({ status: 'closed' });
    sendSuccess(res, null, 'Job closed successfully.');
  } catch (err) {
    next(err);
  }
};

// PUT /api/employer/jobs/:id/status
export const changeJobStatus = async (req, res, next) => {
  try {
    const employer = await resolveEmployer(req.user.id);
    if (!employer) return sendError(res, 'Company profile not found.', 404);

    const job = await JobListing.findOne({
      where: { id: req.params.id, employerId: employer.id },
    });
    if (!job) return sendError(res, 'Job not found or not authorised.', 404);

    const { status, expiresAt } = req.body;

    // Expired jobs can only be renewed by providing a new future expiry date
    if (job.status === 'expired' && status === 'active') {
      if (!expiresAt) {
        return sendError(res, 'Provide a new expiresAt date to renew an expired job.', 422);
      }
      const newExpiry = new Date(expiresAt);
      if (newExpiry <= new Date()) {
        return sendError(res, 'The new expiry date must be in the future.', 422);
      }
      await job.update({ status: 'active', expiresAt: newExpiry });
      return sendSuccess(res, { job }, 'Job renewed and published.');
    }

    await job.update({ status });
    sendSuccess(res, { job }, `Job status changed to "${status}".`);
  } catch (err) {
    next(err);
  }
};
