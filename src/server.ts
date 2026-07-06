import app from '@/app';
import { connectDB } from '@/configs/database.config';
import { env } from '@/configs/env.config';
import { seedArchetypes } from '@/modules/archetypes/archetype.service';
import mongoose from 'mongoose';

const server = init();

async function init() {
  try {
    await connectDB();
    await seedArchetypes();

    const PORT = Number(process.env.PORT || env.PORT || 5000);

    console.log(`Starting InterviewMe API server...`);
    console.log(`Port: ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`InterviewMe API server started successfully`);
      console.log(`Listening on port ${PORT}`);
      console.log(`Health check available at http://0.0.0.0:${PORT}/ping`);
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      // handles startup crashes when Node.js fails to bind the server to a network port.
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

      switch (error.code) {
        case 'EACCES': // Permission Denied
          console.error(`${bind} requires elevated privileges`);
          break;
        case 'EADDRINUSE': // Port is Blocked
          console.error(`${bind} is already in use`);
          break;
        default:
          throw error;
        }
        process.exit(1);
    });

    return server;
  } catch (error) {
    console.error(`An error occurred during server initialization:`, error);
    process.exit(1);
  }
}
let isShuttingDown = false;

async function handleShutdown(signal: string) {
  if (isShuttingDown) return; // Prevent duplicate shutdown triggers
  isShuttingDown = true;

  console.log(`${signal} received. Starting graceful shutdown...`);

  // 1. Force exit if cleanup takes too long (e.g., stuck connections)
  const forceExitTimeout = setTimeout(() => {
    console.error('Shutdown timed out! Forcing exit via SIGKILL mimic.');
    process.exit(1);
  }, 10000); // 10 seconds

  try {
    // 2. Stop accepting new HTTP requests and wait for active ones to finish
    await new Promise(async (resolve, reject) => {
      (await server).close((err) => {
        if (err) return reject(err);
        console.log('HTTP server closed. No active connections.');
        resolve('Server closed');
      });
    });

    // 3. Clean up other resources (databases, queues, cache connections)
    await mongoose.disconnect();

    // 4. Clear the timeout and exit cleanly
    clearTimeout(forceExitTimeout);
    console.log('Shutdown complete. Exiting.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Intercept system shutdown requests
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

// --- CRASH SAFETY NETS ---
process.on('uncaughtException', (error) => {
  console.error('CRITICAL: Uncaught Exception!', error);
  // Do not keep the process alive; memory is corrupted. Clean up and crash.
  handleShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);
  // Optional: In modern Node.js, you should also crash here.
  handleShutdown('UNHANDLED_REJECTION');
});
