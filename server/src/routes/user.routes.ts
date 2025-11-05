import { Router, Request, Response } from 'express';
import { db } from '../services/database.service';
import { authenticate } from '../middleware/auth.middleware';
import { userIdParamValidation, updateBalanceValidation } from '../middleware/validation.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../services/logger.service';

const router = Router();

/**
 * GET /api/users/:userId
 * Get user profile (protected)
 */
router.get(
  '/:userId',
  authenticate,
  userIdParamValidation,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    // Users can only access their own profile
    if (userId !== req.userId) {
      logger.warn('Unauthorized access attempt', { requestedUserId: userId, actualUserId: req.userId });
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

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
 * Update user profile (protected)
 */
router.put(
  '/:userId',
  authenticate,
  userIdParamValidation,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    // Users can only update their own profile
    if (userId !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const updates = req.body;

    // Prevent updating sensitive fields
    delete updates.id;
    delete updates.password;
    delete updates.email;
    delete updates.phone;
    delete updates.balance;
    delete updates.createdAt;
    delete updates.updatedAt;

    const user = await db.updateUser(userId, updates);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    logger.info('User profile updated', { userId });

    const { password, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      data: userWithoutPassword,
    });
  })
);

/**
 * PUT /api/users/:userId/balance
 * Update user balance (protected - admin only in future)
 */
router.put(
  '/:userId/balance',
  authenticate,
  updateBalanceValidation,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { balance } = req.body;

    // Users can only update their own balance (for now)
    // TODO: Add admin role check
    if (userId !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const user = await db.updateUserBalance(userId, balance);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    logger.info('User balance updated', { userId, newBalance: balance });

    const { password, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      data: userWithoutPassword,
    });
  })
);

export default router;
