import rateLimit from 'express-rate-limit';
import { config } from '../config';

/**
 * General API rate limiter
 * Applies to all API routes
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.nodeEnv === 'production' ? 100 : 1000, // 100 requests per 15min in prod
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15min
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    error: 'Too many login attempts, please try again after 15 minutes.',
  },
});

/**
 * Rate limiter for call initiation
 * Prevents abuse and cost overruns
 */
export const callLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: config.nodeEnv === 'production' ? 50 : 100, // 50 calls per hour in prod
  message: {
    success: false,
    error: 'Call limit exceeded. Please try again later.',
  },
  keyGenerator: (req) => {
    // Rate limit per user if authenticated, otherwise per IP
    return req.userId || req.ip || 'unknown';
  },
});

/**
 * Rate limiter for contact operations
 */
export const contactLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    success: false,
    error: 'Too many contact operations, please slow down.',
  },
});

/**
 * Rate limiter for registration
 * Prevents spam registrations
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: {
    success: false,
    error: 'Too many accounts created from this IP, please try again later.',
  },
});
