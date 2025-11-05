import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { logger } from '../services/logger.service';

// Extend Express Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

/**
 * Middleware to authenticate JWT token
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No token provided. Please authenticate.',
      });
      return; // ✅ explicitly return
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = authService.verifyToken(token);

    // Attach user info to request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    next(); // ✅ ensures flow continues to next middleware
  } catch (error) {
    logger.error('Authentication error:', error);

    if (error instanceof Error && error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: 'Token expired. Please login again.',
      });
      return; // ✅ explicitly return
    }

    res.status(401).json({
      success: false,
      error: 'Invalid token. Please authenticate.',
    });
    return; // ✅ explicitly return
  }
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work differently for authenticated users
 */
export const optionalAuth = async (
  req: Request,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = authService.verifyToken(token);
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
