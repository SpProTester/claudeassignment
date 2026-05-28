import 'dotenv/config';
import app from './app.js';
import { sequelize } from './models/index.js';
import { startJobExpiryCron } from './services/job-expiry.cron.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Sync models in development (use migrations in production)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Models synced.');
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
    });

    startJobExpiryCron();
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
