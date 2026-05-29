import 'dotenv/config';
import { createServer } from 'node:http';
import app from './app.js';
import { sequelize } from './models/index.js';
import { startJobExpiryCron } from './services/job-expiry.cron.js';
import { startJobAlertCron } from './services/job-alert.cron.js';
import { initSocket } from './socket.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    const httpServer = createServer(app);
    initSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
    });

    startJobExpiryCron();
    startJobAlertCron();
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
