import { Router, Request, Response } from 'express';
import { twilioService } from '../services/twilio.service';

const router = Router();

/**
 * GET /api/token
 * Get Twilio access token for Voice SDK
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string || '1';
    const identity = `user_${userId}`;

    const tokenData = twilioService.generateAccessToken(identity);  // REMOVED userId parameter

    return res.json({  // ADD return here
      success: true,
      data: tokenData,
    });
  } catch (error) {
    console.error('Error generating token:', error);
    return res.status(500).json({  // ADD return here
      success: false,
      error: 'Failed to generate access token',
    });
  }
});

export default router;
