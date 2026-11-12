import { ENV } from '../config/env.js';

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: `The requested endpoint '${req.method} ${req.originalUrl}' does not exist.`
    }
  });
}

export function globalErrorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const isProd = ENV.NODE_ENV === 'production';

  // Securely log internally
  console.error(`[Error] [${req.method} ${req.url}] ${err.message}`, isProd ? '' : err.stack);

  // Return clean, non-leaking JSON error response to client
  res.status(statusCode).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: statusCode === 500 && isProd
        ? 'An unexpected error occurred. Please try again later.'
        : err.message,
      timestamp: new Date().toISOString()
    }
  });
}

