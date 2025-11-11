import { Router, Request, Response } from 'express';
import { twilioService } from '../services/twilio.service';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../services/logger.service';

const router = Router();

/**
 * GET /api/token
 * Get Twilio access token for Voice SDK
 * REQUIRES AUTHENTICATION - only authenticated users can get tokens
 */
router.get(
  '/',
  authenticate,  // ← ADD authentication requirement
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;  // From auth middleware
    const identity = `user_${userId}`;

    const tokenData = twilioService.generateAccessToken(identity);

    logger.info('Twilio token generated', { userId, identity });

    return res.json({
      success: true,
      data: tokenData,
    });
  })
);

export default router;
