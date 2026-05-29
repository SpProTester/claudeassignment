import cron from 'node-cron';
import { Op } from 'sequelize';
import { JobAlert, JobListing, EmployerProfile, User } from '../models/index.js';
import { sendAlertDigestEmail } from '../utils/email.utils.js';

const DAY_MS  = 24 * 60 * 60 * 1000;
const WEEK_MS =  7 * DAY_MS;

// ── Build the JobListing WHERE clause from a saved alert ──────────────────────

const buildJobWhere = (alert, since) => {
  const where = {
    status: 'active',
    createdAt: { [Op.gte]: since },
  };

  if (alert.jobType)         where.jobType         = alert.jobType;
  if (alert.workMode)        where.workMode        = alert.workMode;
  if (alert.experienceLevel) where.experienceLevel = alert.experienceLevel;
  if (alert.salaryMin)       where.salaryMin       = { [Op.gte]: alert.salaryMin };

  if (alert.location) {
    where.location = { [Op.iLike]: `%${alert.location}%` };
  }

  if (alert.keywords) {
    const pattern = `%${alert.keywords}%`;
    where[Op.or] = [
      { title:       { [Op.iLike]: pattern } },
      { description: { [Op.iLike]: pattern } },
    ];
  }

  return where;
};

// ── Process a single alert: query jobs, send digest, stamp lastSentAt ─────────

const processAlert = async (alert, seeker) => {
  const now        = new Date();
  const lookbackMs = alert.frequency === 'weekly' ? WEEK_MS : DAY_MS;

  // Don't look further back than one full period to avoid duplicate sends after
  // a server outage — lastSentAt acts as a high-water mark.
  const floorDate = new Date(now.getTime() - lookbackMs);
  const since     = alert.lastSentAt && alert.lastSentAt > floorDate
    ? alert.lastSentAt
    : floorDate;

  const jobs = await JobListing.findAll({
    where: buildJobWhere(alert, since),
    include: [
      {
        model: EmployerProfile,
        as: 'employer',
        attributes: ['companyName', 'companySlug', 'logoUrl'],
      },
    ],
    order: [['createdAt', 'DESC']],
    limit: 10,
  });

  if (jobs.length === 0) return false;

  await sendAlertDigestEmail({ to: seeker.email, seekerName: seeker.fullName, alert, jobs });
  await alert.update({ lastSentAt: now });
  return true;
};

// ── Eligibility check: weekly alerts skip if < 7 days since last send ─────────

const isEligible = (alert, now) => {
  if (alert.frequency !== 'weekly') return true;
  if (!alert.lastSentAt) return true;
  return now - alert.lastSentAt >= WEEK_MS;
};

// ── Main cron entry point ─────────────────────────────────────────────────────

export const startJobAlertCron = () => {
  // Daily at 08:00 server time
  cron.schedule('0 8 * * *', async () => {
    const now = new Date();
    console.log(`[job-alerts] Digest run started at ${now.toISOString()}`);

    try {
      const alerts = await JobAlert.findAll({
        where: { isActive: true },
        include: [
          { model: User, as: 'seeker', attributes: ['id', 'email', 'fullName'] },
        ],
      });

      let sent = 0, skipped = 0, errored = 0;

      for (const alert of alerts) {
        if (!alert.seeker?.email) { skipped++; continue; }
        if (!isEligible(alert, now)) { skipped++; continue; }

        try {
          const digested = await processAlert(alert, alert.seeker);
          digested ? sent++ : skipped++;
        } catch (err) {
          errored++;
          console.error(`[job-alerts] Alert ${alert.id} failed:`, err.message);
        }
      }

      console.log(
        `[job-alerts] Done — ${sent} digest(s) sent, ${skipped} skipped, ${errored} errored.`
      );
    } catch (err) {
      console.error('[job-alerts] Cron run failed:', err.message);
    }
  });

  console.log('[job-alerts] Job alert cron scheduled (runs daily at 08:00).');
};
