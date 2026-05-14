const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const { notFound, errorHandler } = require('./middleware/error.middleware');
const { isUsingMemoryStore } = require('./config/db');
const cacheService = require('./services/cache.service');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const solverRoutes = require('./routes/solver.routes');
const app = express();
app.use(helmet()); // Set security HTTP headers
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    exposedHeaders: ['X-Cache', 'X-Cache-Type'], // Allow frontend to read cache headers
  })
);
app.use(express.json({ limit: '10kb' })); // Limit body size for security
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use('/api', apiLimiter);
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CUBEMINE API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    storage: isUsingMemoryStore() ? 'memory' : 'mongodb',
    cache: cacheService.getStats(),
  });
});
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/solver', solverRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
