const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user.route');
const { errorHandler } = require('./middleware/errors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const startupRoutes = require('./routes/startup.route');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }));
  app.use(express.json({ limit: '20kb' }));
  app.use(cookieParser());

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

  app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));
  app.use(errorHandler);

  return app;
}

module.exports = createApp;