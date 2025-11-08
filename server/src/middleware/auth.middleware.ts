import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { logger } from '../services/logger.service';
import { db } from '../services/database.service';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      userRole?: 'USER' | 'ADMIN';
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
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No token provided. Please authenticate.',
      });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyToken(token);

    // Get user to verify they exist and get their role
    const user = await db.getUser(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found. Please authenticate again.',
      });
      return;
    }

    // Attach user info to request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = user.role as 'USER' | 'ADMIN';

    next();
  } catch (error) {
    logger.error('Authentication error:', error);

    if (error instanceof Error && error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: 'Token expired. Please login again.',
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: 'Invalid token. Please authenticate.',
    });
    return;
  }
};

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.userId) {
    res.status(401).json({
      success: false,
      error: 'Authentication required.',
    });
    return;
  }

  if (req.userRole !== 'ADMIN') {
    logger.warn('Unauthorized admin access attempt', {
      userId: req.userId,
      role: req.userRole
    });

    res.status(403).json({
      success: false,
      error: 'Admin access required.',
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user has USER role (can make calls)
 */
export const requireUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.userId) {
    res.status(401).json({
      success: false,
      error: 'Authentication required.',
    });
    return;
  }

  if (req.userRole !== 'USER') {
    logger.warn('User-only action attempted by admin', {
      userId: req.userId,
      role: req.userRole
    });

    res.status(403).json({
      success: false,
      error: 'This action is only available to regular users. Admins cannot make calls.',
    });
    return;
  }

  next();
};

/**
 * Middleware to verify user can only access their own resources
 */
export const requireOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const resourceUserId = req.params.userId || req.query.userId as string;

  // Admins can access any user's resources
  if (req.userRole === 'ADMIN') {
    next();
    return;
  }

  // Regular users can only access their own resources
  if (resourceUserId && resourceUserId !== req.userId) {
    logger.warn('Unauthorized resource access attempt', {
      requestedUserId: resourceUserId,
      actualUserId: req.userId
    });

    res.status(403).json({
      success: false,
      error: 'Access denied. You can only access your own resources.',
    });
    return;
  }

  next();
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = authService.verifyToken(token);

      const user = await db.getUser(decoded.userId);
      if (user) {
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        req.userRole = user.role as 'USER' | 'ADMIN';
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
