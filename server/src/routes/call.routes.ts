import { Router, Request, Response } from 'express';
import { twilioService } from '../services/twilio.service';
import { db } from '../services/database.service';
import { authenticate, requireUser, requireOwnership } from '../middleware/auth.middleware';
import { makeCallValidation, callHistoryQueryValidation } from '../middleware/validation.middleware';
import { callLimiter } from '../middleware/rateLimiting.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../services/logger.service';
import type { MakeCallRequest, CallHistoryRecord } from '../types';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * POST /api/calls
 * Initiate an outbound call (USER role only, scoped to authenticated user)
 */
router.post(
  '/',
  authenticate,
  requireUser, // Only users can make calls, not admins
  callLimiter,
  makeCallValidation,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { to, from }: MakeCallRequest = req.body;

    // Verify the 'from' number belongs to the authenticated user
    const user = await db.getUser(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Verify user owns the 'from' phone number
    if (user.phone !== from) {
      logger.warn('User attempted to use unauthorized phone number', {
        userId,
        userPhone: user.phone,
        requestedFrom: from
      });

      return res.status(403).json({
        success: false,
        error: 'You can only make calls from your registered phone number',
      });
    }

    // Check balance
    const estimatedRate = twilioService.getRateForDestination(to);
    const minimumBalance = estimatedRate * 2; // Require balance for at least 2 minutes

    if (user.balance < minimumBalance) {
      logger.warn('Insufficient balance for call', {
        userId,
        balance: user.balance,
        required: minimumBalance
      });

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

    logger.info('Call initiated', {
      userId,
      callSid: callResponse.callSid,
      to,
      from
    });

    return res.json({
      success: true,
      data: callResponse,
    });
  })
);

/**
 * GET /api/calls/history
 * Get call history for authenticated user (scoped to their calls only)
 */
router.get(
  '/history',
  authenticate,
  requireOwnership, // Admins can view any user's history, users only their own
  callHistoryQueryValidation,
  asyncHandler(async (req: Request, res: Response) => {
    // If admin is viewing another user's history
    const targetUserId = (req.query.userId as string) || req.userId!;
    const limit = parseInt(req.query.limit as string) || 50;

    const history = await db.getCallHistory(targetUserId, limit);

    return res.json({
      success: true,
      data: history,
    });
  })
);

/**
 * GET /api/calls/history/contact/:phone
 * Get call history for specific contact (scoped to authenticated user)
 */
router.get(
  '/history/contact/:phone',
  authenticate,
  requireOwnership,
  asyncHandler(async (req: Request, res: Response) => {
    const targetUserId = (req.query.userId as string) || req.userId!;
    const { phone } = req.params;

    const history = await db.getCallHistoryForContact(targetUserId, phone);

    return res.json({
      success: true,
      data: history,
    });
  })
);

/**
 * POST /api/calls/history
 * Save call history record (scoped to authenticated user)
 */
router.post(
  '/history',
  authenticate,
  requireUser, // Only users can save call records, not admins
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const user = await db.getUser(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Verify the call belongs to this user
    const callPhone = req.body.from;
    if (callPhone !== user.phone) {
      logger.warn('User attempted to save call for another user', {
        userId,
        userPhone: user.phone,
        callPhone
      });

      return res.status(403).json({
        success: false,
        error: 'You can only save your own call records',
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

    // Update call-related metrics
    if (recordData.status === 'completed' && recordData.duration > 0) {
      // Deduct cost from user balance
      const newBalance = user.balance - recordData.cost;
      await db.updateUserBalance(userId, Math.max(0, newBalance));

      // Update total call duration (convert seconds to minutes)
      const durationMinutes = Math.ceil(recordData.duration / 60);
      const newTotalDuration = user.totalCallDuration + durationMinutes;
      await db.updateUser(userId, { totalCallDuration: newTotalDuration });

      logger.info('Call metrics updated', {
        userId,
        cost: recordData.cost,
        newBalance: Math.max(0, newBalance),
        durationMinutes,
        newTotalDuration,
      });
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

/**
 * GET /api/calls/stats
 * Get call statistics for authenticated user
 */
router.get(
  '/stats',
  authenticate,
  requireOwnership,
  asyncHandler(async (req: Request, res: Response) => {
    const targetUserId = (req.query.userId as string) || req.userId!;

    const stats = await db.getUserCallStats(targetUserId);

    return res.json({
      success: true,
      data: stats,
    });
  })
);

export default router;
