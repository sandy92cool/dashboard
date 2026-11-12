import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import morgan from 'morgan';
import { ENV } from './config/env.js';
import { dbManager } from './database/connection.js';
import {
  helmetMiddleware,
  corsMiddleware,
  rateLimiterMiddleware,
  hppMiddleware,
  noSqlSanitizer
} from './middleware/security.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';
import apiRouter from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLIENT_DIST = path.resolve(__dirname, '../../client/dist');

const app = express();

// 1. Core Security Middlewares
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(rateLimiterMiddleware);
app.use(hppMiddleware);

// 2. Strict body parser limits (Anti-DoS)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// 3. NoSQL / Parameter Injection Sanitizer
app.use(noSqlSanitizer);

// 4. Request Logging (Structured)
if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('[:date[iso]] :method :url :status :response-time ms - :res[content-length]'));
}

// 5. Mount API Routes
app.use('/api', apiRouter);

// 6. Serve React Production Build
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(CLIENT_DIST, 'index.html'));
    }
    next();
  });
}

// 7. Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

// 7. Server Bootstrap & Graceful Shutdown
async function startServer() {
  await dbManager.initialize();

  const server = app.listen(ENV.PORT, () => {
    console.log(`=======================================================`);
    console.log(`🛡️  Insurance Analytics API Server (Node.js/Express)`);
    console.log(`🚀 Running on port: http://localhost:${ENV.PORT}`);
    console.log(`🔒 Security: Helmet, CORS, RateLimit, HPP, Sanitizer active`);
    console.log(`=======================================================`);
  });

  const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Gracefully shutting down...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch(err => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});

export default app;
