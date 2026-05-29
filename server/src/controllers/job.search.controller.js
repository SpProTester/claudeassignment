import { QueryTypes } from 'sequelize';
import { sequelize } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';

/* ─── Constants ───────────────────────────────────────────────── */

const VALID_JOB_TYPES        = ['full-time', 'part-time', 'contract', 'freelance', 'internship'];
const VALID_WORK_MODES       = ['onsite', 'remote', 'hybrid'];
const VALID_EXPERIENCE_LEVELS = ['entry', 'mid', 'senior', 'lead', 'executive'];
const VALID_SORT_BY          = ['relevance', 'date', 'salary'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* ─── Query Builder ───────────────────────────────────────────── */

/**
 * Builds parameterized SQL for the job search endpoint.
 *
 * All user values are passed via bind arrays ($1, $2 …) — never
 * interpolated into SQL text. Dynamic SQL text is ORDER BY direction
 * only, chosen from a hardcoded switch.
 *
 * Supports comma-separated multi-value filters for job_type,
 * work_mode, and experience_level (generates IN clauses).
 */
function buildSearchQuery(filters, limit, offset) {
  const fp = [];
  const push = (v) => { fp.push(v); return `$${fp.length}`; };

  const conds = [`jl.status = 'active'`];
  let ftsExpr = null;

  // ── Full-text search (title A, description B) ────────────────
  if (filters.keyword) {
    const $k = push(filters.keyword);
    conds.push(`jl.search_vector @@ plainto_tsquery('english', ${$k})`);
    ftsExpr = `ts_rank(jl.search_vector, plainto_tsquery('english', ${$k}))`;
  }

  if (filters.location) {
    conds.push(`jl.location ILIKE ${push('%' + filters.location + '%')}`);
  }

  // ── Multi-value IN helper ────────────────────────────────────
  // Accepts comma-separated strings; silently drops unknown values.
  const addIn = (col, rawValue, validSet) => {
    if (!rawValue) return;
    const vals = rawValue.split(',').map(v => v.trim()).filter(v => validSet.includes(v));
    if (!vals.length) return;
    if (vals.length === 1) {
      conds.push(`${col} = ${push(vals[0])}`);
    } else {
      const binds = vals.map(v => push(v));
      conds.push(`${col} IN (${binds.join(', ')})`);
    }
  };

  addIn('jl.job_type',         filters.jobType,         VALID_JOB_TYPES);
  addIn('jl.work_mode',        filters.workMode,        VALID_WORK_MODES);
  addIn('jl.experience_level', filters.experienceLevel, VALID_EXPERIENCE_LEVELS);

  // Salary: overlapping interval — job's range must intersect query range
  if (filters.salaryMin != null) conds.push(`jl.salary_max >= ${push(filters.salaryMin)}`);
  if (filters.salaryMax != null) conds.push(`jl.salary_min <= ${push(filters.salaryMax)}`);
  if (filters.categoryId)        conds.push(`jl.category_id = ${push(filters.categoryId)}`);

  // Company filter — ep already joined
  if (filters.companySlug) conds.push(`ep.company_slug = ${push(filters.companySlug)}`);

  const WHERE = conds.join('\n      AND ');

  // ── ORDER BY ─────────────────────────────────────────────────
  let ORDER;
  if (filters.sortBy === 'relevance' && ftsExpr) {
    ORDER = `${ftsExpr} DESC, jl.created_at DESC`;
  } else if (filters.sortBy === 'salary') {
    ORDER = `jl.salary_max DESC NULLS LAST, jl.created_at DESC`;
  } else {
    ORDER = `jl.created_at DESC`;
  }

  // ── Count (shares filter params; employer join needed for companySlug) ──
  const countSql = `
    SELECT COUNT(*) AS total
    FROM   job_listings     jl
    JOIN   employer_profiles ep ON ep.id = jl.employer_id
    WHERE  ${WHERE}
  `.trim();
  const countParams = [...fp];

  // ── Main (appends LIMIT + OFFSET) ────────────────────────────
  const mp = [...fp, limit, offset];
  const $lim = `$${mp.length - 1}`;
  const $off = `$${mp.length}`;

  const rankSelect = ftsExpr
    ? `, ${ftsExpr}  AS rank`
    : `, 0::float    AS rank`;

  const mainSql = `
    SELECT
      jl.id,
      jl.title,
      jl.slug,
      jl.job_type,
      jl.work_mode,
      jl.experience_level,
      jl.location,
      jl.salary_min,
      jl.salary_max,
      jl.status,
      jl.views_count,
      jl.expires_at,
      jl.created_at,
      jl.updated_at,
      jl.category_id,
      ep.id            AS employer_id,
      ep.company_name,
      ep.company_slug,
      ep.logo_url,
      ep.industry
      ${rankSelect}
    FROM  job_listings     jl
    JOIN  employer_profiles ep ON ep.id = jl.employer_id
    WHERE ${WHERE}
    ORDER BY ${ORDER}
    LIMIT  ${$lim}
    OFFSET ${$off}
  `.trim();

  return { mainSql, mainParams: mp, countSql, countParams };
}

/* ─── Handlers ────────────────────────────────────────────────── */

/**
 * GET /api/jobs
 * Full-text search with multi-dimensional filtering + pagination.
 * Comma-separated values accepted for job_type, work_mode, experience_level.
 */
export const searchJobs = async (req, res, next) => {
  try {
    const q = req.query;

    const page  = Math.max(1, parseInt(q.page,  10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(q.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const keyword         = q.keyword?.trim()  || null;
    const location        = q.location?.trim() || null;
    const sortBy          = q.sort_by          || 'date';
    const jobType         = q.job_type  ? q.job_type.replace(/_/g, '-')  : null;
    const workMode        = q.work_mode        || null;
    const experienceLevel = q.experience_level || null;
    const categoryId      = q.category_id      || null;
    const companySlug     = q.company_slug     || null;
    const salaryMin       = q.salary_min != null && q.salary_min !== '' ? parseInt(q.salary_min, 10) : null;
    const salaryMax       = q.salary_max != null && q.salary_max !== '' ? parseInt(q.salary_max, 10) : null;

    // ── Validation ───────────────────────────────────────────────
    const validateMulti = (raw, valid, field) => {
      if (!raw) return null;
      for (const v of raw.split(',').map(s => s.trim())) {
        if (!valid.includes(v))
          return `Invalid ${field}: "${v}". Allowed: ${valid.join(', ')}`;
      }
      return null;
    };

    const errs = [
      sortBy          && !VALID_SORT_BY.includes(sortBy)   ? `sort_by must be one of: ${VALID_SORT_BY.join(', ')}` : null,
      validateMulti(jobType,         VALID_JOB_TYPES,         'job_type'),
      validateMulti(workMode,        VALID_WORK_MODES,        'work_mode'),
      validateMulti(experienceLevel, VALID_EXPERIENCE_LEVELS, 'experience_level'),
      categoryId && !UUID_RE.test(categoryId) ? 'category_id must be a valid UUID.' : null,
      salaryMin != null && isNaN(salaryMin)   ? 'salary_min must be a number.' : null,
      salaryMax != null && isNaN(salaryMax)   ? 'salary_max must be a number.' : null,
    ].filter(Boolean);

    if (errs.length) return sendError(res, errs[0], 400);

    const filters = { keyword, location, jobType, workMode, experienceLevel,
                      salaryMin, salaryMax, categoryId, companySlug, sortBy };

    const { mainSql, mainParams, countSql, countParams } = buildSearchQuery(filters, limit, offset);

    const [jobs, [{ total }]] = await Promise.all([
      sequelize.query(mainSql, { bind: mainParams, type: QueryTypes.SELECT }),
      sequelize.query(countSql, { bind: countParams, type: QueryTypes.SELECT }),
    ]);

    // Log keyword for trending (fire-and-forget)
    if (keyword) {
      sequelize
        .query('INSERT INTO search_logs (keyword) VALUES ($1)', {
          bind: [keyword.toLowerCase()],
          type: QueryTypes.INSERT,
        })
        .catch(() => {});
    }

    sendSuccess(res, {
      jobs,
      pagination: {
        total:  parseInt(total, 10),
        page,
        pages:  Math.ceil(parseInt(total, 10) / limit),
        limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/jobs/categories
 * All categories with live count of active listings.
 */
export const getCategories = async (req, res, next) => {
  try {
    const sql = `
      SELECT
        jc.id,
        jc.name,
        jc.slug,
        jc.icon,
        COUNT(jl.id) FILTER (WHERE jl.status = 'active') AS job_count
      FROM  job_categories jc
      LEFT  JOIN job_listings jl ON jl.category_id = jc.id
      GROUP BY jc.id
      ORDER BY job_count DESC, jc.name ASC
    `.trim();

    const rows = await sequelize.query(sql, { type: QueryTypes.SELECT });
    sendSuccess(res, {
      categories: rows.map(c => ({ ...c, job_count: parseInt(c.job_count, 10) })),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/jobs/trending
 * Top 10 searched keywords in the last 7 days.
 */
export const getTrendingKeywords = async (req, res, next) => {
  try {
    const sql = `
      SELECT keyword, COUNT(*) AS search_count
      FROM   search_logs
      WHERE  searched_at >= NOW() - INTERVAL '7 days'
        AND  keyword <> ''
      GROUP  BY keyword
      ORDER  BY search_count DESC
      LIMIT  10
    `.trim();

    const rows = await sequelize.query(sql, { type: QueryTypes.SELECT });
    sendSuccess(res, {
      keywords: rows.map(r => ({ keyword: r.keyword, search_count: parseInt(r.search_count, 10) })),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/jobs/:slug
 * Single job detail by slug. Increments views_count atomically via CTE.
 */
export const getJobBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const sql = `
      WITH updated AS (
        UPDATE job_listings
        SET    views_count = views_count + 1
        WHERE  slug   = $1
          AND  status = 'active'
        RETURNING *
      )
      SELECT
        u.id,        u.title,     u.slug,          u.description,
        u.job_type,  u.work_mode, u.experience_level,
        u.location,  u.salary_min, u.salary_max,
        u.status,    u.views_count, u.expires_at,
        u.created_at, u.updated_at, u.category_id,
        ep.id            AS employer_id,
        ep.company_name,
        ep.company_slug,
        ep.logo_url,
        ep.website_url,
        ep.industry,
        ep.company_size,
        ep.is_verified   AS employer_verified,
        u2.email         AS employer_email
      FROM       updated           u
      JOIN       employer_profiles ep ON ep.id  = u.employer_id
      JOIN       users             u2 ON u2.id  = ep.user_id
    `.trim();

    const rows = await sequelize.query(sql, { bind: [slug], type: QueryTypes.SELECT });
    if (!rows.length) return sendError(res, 'Job not found.', 404);

    sendSuccess(res, { job: rows[0] });
  } catch (err) {
    next(err);
  }
};
