import { Router, Request, Response } from 'express';
import { db } from '../services/database.service';

const router = Router();

/**
 * GET /api/users/:userId
 * Get user profile
 */
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await db.getUser(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
    });
  }
});

/**
 * PUT /api/users/:userId
 * Update user profile
 */
router.put('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const user = await db.updateUser(userId, updates);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update user',
    });
  }
});

/**
 * PUT /api/users/:userId/balance
 * Update user balance
 */
router.put('/:userId/balance', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { balance } = req.body;

    if (typeof balance !== 'number' || balance < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid balance value',
      });
    }

    const user = await db.updateUserBalance(userId, balance);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error updating balance:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update balance',
    });
  }
});

export default router;
