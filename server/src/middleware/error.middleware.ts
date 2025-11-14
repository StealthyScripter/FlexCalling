import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger.service';
import { config } from '../config';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: req.userId,
  });

  // Determine status code
  let statusCode = 500;
  let message = 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError' || err.message.includes('Invalid credentials')) {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (err.message.includes('not found')) {
    statusCode = 404;
    message = err.message;
  } else if (err.message.includes('already exists')) {
    statusCode = 409;
    message = err.message;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: config.nodeEnv === 'development' ? err.message : message,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

/**
 * Async error wrapper
 * Catches async errors and passes them to error handler
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.url,
  });
};
