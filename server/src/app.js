const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./middleware/errors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const userRoutes = require('./routes/user.route');
const startupRoutes = require('./routes/startup.route');
const savedStartupRoutes = require('./routes/savedStartup.route');

// Absolute path to the built React app (frontend/dist relative to repo root).
// __dirname is server/src, so we go up two levels then into frontend/dist.
const DIST_DIR = path.resolve(__dirname, '../../frontend/dist');

function createApp() {
  const app = express();

  // Trust the first proxy hop (Render's load balancer) so express-rate-limit
  // reads the real client IP from X-Forwarded-For rather than the proxy IP.
  app.set('trust proxy', 1);

  app.use(helmet());

  // In production the frontend is served from the same origin, so CORS is only
  // needed in development. CLIENT_ORIGIN is still respected if set.
  app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }));

  app.use(express.json({ limit: '20kb' }));
  app.use(cookieParser());

  // ── API routes ────────────────────────────────────────────────────────────

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many attempts. Please try again later.',
    },
  });

  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/login', authLimiter);

  app.use('/api/auth', userRoutes);
  app.use('/api/startups', startupRoutes);
  app.use('/api/saved-startups', savedStartupRoutes);

  // Unknown /api routes return JSON 404 (must come before the SPA fallback).
  app.use('/api', (req, res) => res.status(404).json({ error: 'Route not found.' }));

  // ── Static frontend (production only) ────────────────────────────────────

  if (process.env.NODE_ENV === 'production') {
    // Serve hashed assets (JS, CSS, images) with long-lived cache.
    app.use(express.static(DIST_DIR, { maxAge: '1y', immutable: true }));

    // SPA fallback: any non-API GET request returns index.html so React Router
    // can handle client-side navigation. Express 5 requires a named wildcard.
    app.get('/*path', (req, res) => {
      res.sendFile(path.join(DIST_DIR, 'index.html'));
    });
  } else {
    // Development: keep the existing JSON 404 for non-API routes.
    app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));
  }

  // Centralized error handler — must remain last.
  app.use(errorHandler);

  return app;
}

module.exports = createApp;