const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { connectDB } = require('./config/db');
const { initCache, disconnect: disconnectCache } = require('./services/cache.service');

const PORT = process.env.PORT || 5000;


const startServer = async () => {
  try {
    await connectDB();
    await initCache();

    const server = app.listen(PORT, () => {
      console.log(`\n🚀 CUBEMINE Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health\n`);
    });

    // ── Graceful shutdown ──
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received — shutting down gracefully...`);
      server.close(async () => {
        await disconnectCache();
        console.log('Server closed.');
        process.exit(0);
      });
      // Force exit after 10s
      setTimeout(() => process.exit(1), 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
