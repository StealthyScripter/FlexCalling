import { Router, Request, Response } from 'express';
import { twilioService } from '../services/twilio.service';
import { db } from '../services/database.service';
import { authenticate } from '../middleware/auth.middleware';
import { makeCallValidation, callHistoryQueryValidation } from '../middleware/validation.middleware';
import { callLimiter } from '../middleware/rateLimiting.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../services/logger.service';
import type { MakeCallRequest, CallHistoryRecord } from '../types';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * POST /api/calls
 * Initiate an outbound call (protected)
 */
router.post(
  '/',
  authenticate,
  callLimiter,
  makeCallValidation,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { to, from }: MakeCallRequest = req.body;

    // Verify user has sufficient balance
    const user = await db.getUser(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const estimatedRate = twilioService.getRateForDestination(to);
    const minimumBalance = estimatedRate * 2; // Require balance for at least 2 minutes

    if (user.balance < minimumBalance) {
      logger.warn('Insufficient balance for call', { userId, balance: user.balance, required: minimumBalance });
      return res.status(402).json({
        success: false,
        error: 'Insufficient balance',
        details: {
          currentBalance: user.balance,
          minimumRequired: minimumBalance,
          ratePerMinute: estimatedRate,
        },
      });
    }

    const callResponse = await twilioService.makeCall({ to, from });

    logger.info('Call initiated', { userId, callSid: callResponse.callSid, to, from });

    return res.json({
      success: true,
      data: callResponse,
    });
  })
);

/**
 * GET /api/calls/history
 * Get call history for authenticated user
 */
router.get(
  '/history',
  authenticate,
  callHistoryQueryValidation,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 50;

    const history = await db.getCallHistory(userId, limit);

    return res.json({
      success: true,
      data: history,
    });
  })
);

/**
 * GET /api/calls/history/contact/:phone
 * Get call history for specific contact
 */
router.get(
  '/history/contact/:phone',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { phone } = req.params;

    const history = await db.getCallHistoryForContact(userId, phone);

    return res.json({
      success: true,
      data: history,
    });
  })
);

/**
 * POST /api/calls/history
 * Save call history record (typically called by webhooks or client)
 */
router.post(
  '/history',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const user = await db.getUser(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const recordData: CallHistoryRecord = {
      id: uuidv4(),
      ...req.body,
      date: new Date(req.body.date),
      startTime: req.body.startTime ? new Date(req.body.startTime) : null,
      endTime: req.body.endTime ? new Date(req.body.endTime) : null,
    };

    // Enrich with contact name if available
    const contactPhone = recordData.direction === 'outgoing' ? recordData.to : recordData.from;
    const contact = await db.getContactByPhone(userId, contactPhone);
    if (contact) {
      recordData.contactName = contact.name;
      recordData.contactId = contact.id;
    }

    const record = await db.createCallRecord(recordData);

    // Deduct call cost from user balance
    if (recordData.status === 'completed' && recordData.cost > 0) {
      const newBalance = user.balance - recordData.cost;
      await db.updateUserBalance(userId, Math.max(0, newBalance));
      logger.info('Balance deducted', { userId, cost: recordData.cost, newBalance: Math.max(0, newBalance) });
    }

    logger.info('Call record saved', { userId, callSid: recordData.callSid });

    return res.status(201).json({
      success: true,
      data: record,
    });
  })
);

/**
 * GET /api/calls/pricing/:phoneNumber
 * Get pricing rate for destination (public endpoint)
 */
router.get('/pricing/:phoneNumber', (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.params;
    const rate = twilioService.getRateForDestination(phoneNumber);

    return res.json({
      success: true,
      data: {
        phoneNumber,
        ratePerMinute: rate,
        currency: 'USD',
      },
    });
  } catch (error) {
    logger.error('Error fetching pricing:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch pricing',
    });
  }
});

export default router;
