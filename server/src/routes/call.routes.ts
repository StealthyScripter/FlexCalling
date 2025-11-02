import { Router, Request, Response } from 'express';
import { twilioService } from '../services/twilio.service';
import { db } from '../services/database.service';
import type { MakeCallRequest, CallHistoryRecord } from '../types';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * POST /api/calls
 * Initiate an outbound call
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { to, from }: MakeCallRequest = req.body;

    if (!to || !from) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, from',
      });
    }

    const callResponse = await twilioService.makeCall({ to, from });

    return res.json({
      success: true,
      data: callResponse,
    });
  } catch (error) {
    console.error('Error making call:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to initiate call',
    });
  }
});

/**
 * GET /api/calls/history
 * Get call history for user
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string || '1';
    const limit = parseInt(req.query.limit as string) || 50;

    const history = await db.getCallHistory(userId, limit);

    return res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Error fetching call history:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch call history',
    });
  }
});

/**
 * GET /api/calls/history/contact/:phone
 * Get call history for specific contact
 */
router.get('/history/contact/:phone', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string || '1';
    const { phone } = req.params;

    const history = await db.getCallHistoryForContact(userId, phone);

    return res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Error fetching contact call history:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch call history',
    });
  }
});

/**
 * POST /api/calls/history
 * Save call history record
 */
router.post('/history', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string || '1';
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
    }

    return res.status(201).json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('Error saving call history:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save call history',
    });
  }
});

/**
 * GET /api/calls/pricing/:phoneNumber
 * Get pricing rate for destination
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
    console.error('Error fetching pricing:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch pricing',
    });
  }
});

export default router;
