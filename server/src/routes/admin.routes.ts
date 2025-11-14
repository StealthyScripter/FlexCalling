import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../services/database.service';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../services/logger.service';
import { body, param, query, validationResult } from 'express-validator';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

/**
 * Validation middleware
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array(),
    });
    return; // stop here, but don't return a value
  }

  next(); // success path
};

/**
 * GET /api/admin/users
 * Get all users with pagination and filtering
 */
router.get(
  '/users',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    query('role').optional().isIn(['USER', 'ADMIN']).withMessage('Invalid role'),
    query('search').optional().isString(),
    handleValidationErrors,
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as 'USER' | 'ADMIN' | undefined;
    const search = req.query.search as string | undefined;
    const skip = (page - 1) * limit;

    const { users, total } = await db.getAllUsers({
      skip,
      take: limit,
      role,
      search,
    });

    // Remove passwords from response
    const sanitizedUsers = users.map(({ password, ...user }) => user);

    logger.info('Admin viewed all users', {
      adminId: req.userId,
      page,
      limit,
      total
    });

    return res.json({
      success: true,
      data: {
        users: sanitizedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  })
);

/**
 * GET /api/admin/users/:userId
 * Get specific user details (including call history)
 */
router.get(
  '/users/:userId',
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
    handleValidationErrors,
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    const user = await db.getUser(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Get user's call statistics
    const callHistory = await db.getCallHistory(userId, 10);
    const contacts = await db.getContacts(userId);

    const { password, ...userWithoutPassword } = user;

    logger.info('Admin viewed user details', {
      adminId: req.userId,
      viewedUserId: userId
    });

    return res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        stats: {
          totalContacts: contacts.length,
          totalCalls: callHistory.length,
          totalDuration: user.totalCallDuration,
        },
        recentCalls: callHistory,
      },
    });
  })
);

/**
 * PUT /api/admin/users/:userId
 * Update user details (name, email, balance, role)
 */
router.put(
  '/users/:userId',
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('email').optional().trim().isEmail().normalizeEmail(),
    body('balance').optional().isFloat({ min: 0 }),
    body('role').optional().isIn(['USER', 'ADMIN']),
    body('isVerified').optional().isBoolean(),
    handleValidationErrors,
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const updates = req.body;

    // Prevent updating sensitive fields via this endpoint
    delete updates.password;
    delete updates.phone;
    delete updates.totalCallDuration;
    delete updates.createdAt;
    delete updates.updatedAt;

    const user = await db.updateUser(userId, updates);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    logger.info('Admin updated user', {
      adminId: req.userId,
      updatedUserId: userId,
      updates: Object.keys(updates),
    });

    const { password, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      data: userWithoutPassword,
    });
  })
);

/**
 * PUT /api/admin/users/:userId/balance
 * Update user balance (add or deduct credits)
 */
router.put(
  '/users/:userId/balance',
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
    body('balance').isFloat({ min: 0 }).withMessage('Balance must be positive'),
    body('reason').optional().isString(),
    handleValidationErrors,
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { balance, reason } = req.body;

    const user = await db.updateUserBalance(userId, balance);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    logger.info('Admin updated user balance', {
      adminId: req.userId,
      updatedUserId: userId,
      newBalance: balance,
      reason,
    });

    const { password, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      data: userWithoutPassword,
    });
  })
);

/**
 * DELETE /api/admin/users/:userId
 * Delete user account (soft delete in future)
 */
router.delete(
  '/users/:userId',
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
    handleValidationErrors,
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.userId) {
      return res.status(400).json({
        success: false,
        error: 'You cannot delete your own account',
      });
    }

    const success = await db.deleteUser(userId);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    logger.warn('Admin deleted user', {
      adminId: req.userId,
      deletedUserId: userId
    });

    return res.json({
      success: true,
      message: 'User deleted successfully',
    });
  })
);

/**
 * GET /api/admin/stats
 * Get platform statistics
 */
router.get(
  '/stats',
  asyncHandler(async (req: Request, res: Response) => {
    const stats = await db.getPlatformStats();

    logger.info('Admin viewed platform stats', { adminId: req.userId });

    return res.json({
      success: true,
      data: stats,
    });
  })
);

/**
 * GET /api/admin/call-history
 * Get all call history across all users
 */
router.get(
  '/call-history',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('userId').optional().isUUID(),
    handleValidationErrors,
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const userId = req.query.userId as string | undefined;
    const skip = (page - 1) * limit;

    const { calls, total } = await db.getAllCallHistory({
      skip,
      take: limit,
      userId,
    });

    logger.info('Admin viewed call history', {
      adminId: req.userId,
      page,
      limit
    });

    return res.json({
      success: true,
      data: {
        calls,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  })
);

export default router;
