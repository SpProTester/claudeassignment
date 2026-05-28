import cron from 'node-cron';
import { Op } from 'sequelize';
import { JobListing } from '../models/index.js';

export const startJobExpiryCron = () => {
  // Run at the top of every hour
  cron.schedule('0 * * * *', async () => {
    try {
      const [count] = await JobListing.update(
        { status: 'expired' },
        {
          where: {
            status: 'active',
            expiresAt: { [Op.lt]: new Date() },
          },
        }
      );
      if (count > 0) {
        console.log(`[job-expiry] Marked ${count} job(s) as expired.`);
      }
    } catch (err) {
      console.error('[job-expiry] Cron error:', err.message);
    }
  });

  console.log('[job-expiry] Job expiry cron scheduled (runs hourly).');
};
