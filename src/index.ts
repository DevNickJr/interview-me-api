import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

init();

async function init() {
  try {
  await connectDB();

    const PORT = Number(process.env.PORT || env.PORT || 5000);

    console.log(`🚀 Starting TOTUM API server...`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

    // Start server immediately so health checks can pass
    // Database connection happens asynchronously
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ TOTUM API server started successfully`);
      console.log(`✅ Listening on port ${PORT}`);
      console.log(`✅ Health check available at http://0.0.0.0:${PORT}/ping`);
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

      switch (error.code) {
        case 'EACCES':
          console.error(`❌ ${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`❌ ${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
  } catch (error) {
    console.error(`❌ An error occurred during server initialization:`, error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);
