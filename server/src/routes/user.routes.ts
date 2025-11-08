import { Router, Request, Response } from 'express';
import { db } from '../services/database.service';
import { authenticate, requireOwnership } from '../middleware/auth.middleware';
import { userIdParamValidation, updateBalanceValidation } from '../middleware/validation.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../services/logger.service';

const router = Router();

/**
 * GET /api/users/:userId
 * Get user profile (authenticated users can view their own, admins can view any)
 */
router.get(
  '/:userId',
  authenticate,
  userIdParamValidation,
  requireOwnership, // Ensures users can only view their own profile, admins can view any
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    const user = await db.getUser(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      data: userWithoutPassword,
    });
  })
);

/**
 * PUT /api/users/:userId
 * Update user profile (users can update their own, admins update via admin routes)
 */
router.put(
  '/:userId',
  authenticate,
  userIdParamValidation,
  requireOwnership,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const updates = req.body;

    // Prevent updating sensitive fields via this endpoint
    delete updates.id;
    delete updates.password;
    delete updates.email;
    delete updates.phone;
    delete updates.balance;
    delete updates.role; // Role can only be changed by admins via admin routes
    delete updates.totalCallDuration; // This is auto-updated
    delete updates.createdAt;
    delete updates.updatedAt;

    const user = await db.updateUser(userId, updates);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    logger.info('User profile updated', { userId, updatedBy: req.userId });

    const { password, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      data: userWithoutPassword,
    });
  })
);

/**
 * PUT /api/users/:userId/balance
 * Update user balance (users can add to their own balance, admins use admin routes)
 */
router.put(
  '/:userId/balance',
  authenticate,
  updateBalanceValidation,
  requireOwnership,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { balance } = req.body;

    // Regular users can only add to their balance, not set arbitrary amounts
    // (unless they're adding credits via payment gateway)
    if (req.userRole !== 'ADMIN') {
      const currentUser = await db.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      // Only allow increasing balance for regular users
      if (balance < currentUser.balance) {
        return res.status(403).json({
          success: false,
          error: 'You can only add credits to your balance. Contact support to reduce balance.',
        });
      }
    }

    const user = await db.updateUserBalance(userId, balance);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    logger.info('User balance updated', {
      userId,
      newBalance: balance,
      updatedBy: req.userId
    });

    const { password, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      data: userWithoutPassword,
    });
  })
);

/**
 * GET /api/users/:userId/stats
 * Get user call statistics
 */
router.get(
  '/:userId/stats',
  authenticate,
  userIdParamValidation,
  requireOwnership,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    const stats = await db.getUserCallStats(userId);

    return res.json({
      success: true,
      data: stats,
    });
  })
);

export default router;
