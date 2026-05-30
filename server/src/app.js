import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import router from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { UPLOADS_ROOT } from './config/paths.js';

const app = express();

// Security headers
app.use(helmet());

// CORS — allow main client and admin portal.
// In development any localhost port is permitted (Vite picks dynamically).
const allowedOrigins = [
  process.env.CLIENT_URL       || 'http://localhost:5173',
  process.env.ADMIN_CLIENT_URL || 'http://localhost:5174',
].filter(Boolean);

const isDev = process.env.NODE_ENV !== 'production';

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return cb(null, true);
      // In development, allow any localhost origin regardless of port
      if (isDev && /^https?:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// Request logging (skip in test)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Cookie parser (required for httpOnly refresh token)
app.use(cookieParser());

// Stripe webhook needs the raw (unparsed) body to verify the signature.
// This must be registered BEFORE express.json() intercepts the request.
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Serve uploaded resumes — token auth happens at the API layer; the static
// route is intentionally unauthenticated so browsers can load files directly
// via a signed URL pattern in future. Lock this down with auth middleware if
// resumes must stay private.
app.use('/uploads', express.static(UPLOADS_ROOT));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API routes
app.use('/api', router);

// 404 handler
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

// Global error handler (must be last)
app.use(errorHandler);

export default app;
