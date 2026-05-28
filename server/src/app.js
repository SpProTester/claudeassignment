import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import router from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// Security headers
app.use(helmet());

// CORS — allow React dev server and configured client URL
app.use(
  cors({
    origin: [process.env.CLIENT_URL || 'http://localhost:5173'],
    credentials: true,
  })
);

// Request logging (skip in test)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting — 100 requests per 15 minutes per IP
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  })
);

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API routes
app.use('/api', router);

// 404 handler
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

// Global error handler (must be last)
app.use(errorHandler);

export default app;
