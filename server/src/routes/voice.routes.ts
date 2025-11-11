import { Router, Request, Response } from 'express';
import { twilioService } from '../services/twilio.service';
import { db } from '../services/database.service';
import { logger } from '../services/logger.service';
import type { CallHistoryRecord } from '../types';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * POST /api/voice/twiml
 * Generate TwiML for call handling
 */
router.post('/twiml', (req: Request, res: Response) => {
  try {
    const { To } = req.body;

    if (!To) {
      return res.status(400).send('Missing required parameter: To');
    }

    const twiml = twilioService.generateTwiML(To);

    res.type('text/xml');
    return res.send(twiml);
  } catch (error) {
    logger.error('Error generating TwiML:', error);
    return res.status(500).send('Error generating TwiML');
  }
});

/**
 * POST /api/voice/status
 * Handle call status callbacks from Twilio
 * This is called by Twilio at various stages of the call
 */
router.post('/status', async (req: Request, res: Response) => {
  try {
    const {
      CallSid,
      CallStatus,
      CallDuration,
      From,
      To,
      Direction,
    } = req.body;

    logger.info('Call status update received', {
      callSid: CallSid,
      status: CallStatus,
      duration: CallDuration,
      from: From,
      to: To,
    });

    // Find the user who made/received this call
    const user = await db.getUserByPhone(From) || await db.getUserByPhone(To);

    if (!user) {
      logger.warn('User not found for call status callback', {
        from: From,
        to: To,
        callSid: CallSid
      });
      return res.sendStatus(200); // Still return 200 to Twilio
    }

    // Handle completed calls - update database with final details
    if (CallStatus === 'completed' && CallDuration) {
      const duration = parseInt(CallDuration);
      const destinationPhone = Direction === 'outbound-api' ? To : From;
      const ratePerMinute = twilioService.getRateForDestination(destinationPhone);
      const durationMinutes = duration / 60;
      const cost = Number((durationMinutes * ratePerMinute).toFixed(4));

      // Try to find existing call record
      const existingCall = await db.getCallByCallSid(CallSid);

      if (existingCall) {
        // Update existing record with final duration and cost
        await db.updateCallRecord(CallSid, {
          status: 'completed',
          duration: duration,
          cost: cost,
          endTime: new Date(),
        });

        // Deduct cost from user balance
        const newBalance = Math.max(0, user.balance - cost);
        await db.updateUserBalance(user.id, newBalance);

        // Update total call duration
        const durationMinutes = Math.ceil(duration / 60);
        const newTotalDuration = user.totalCallDuration + durationMinutes;
        await db.updateUser(user.id, { totalCallDuration: newTotalDuration });

        logger.info('Call completed and updated', {
          userId: user.id,
          callSid: CallSid,
          duration,
          cost,
          newBalance,
        });
      } else {
        // Create new call record if it doesn't exist
        const callRecord: CallHistoryRecord = {
          id: uuidv4(),
          callSid: CallSid,
          from: From,
          to: To,
          direction: Direction === 'outbound-api' ? 'outgoing' : 'incoming',
          status: 'completed',
          date: new Date(),
          startTime: new Date(Date.now() - duration * 1000),
          endTime: new Date(),
          duration: duration,
          cost: cost,
          ratePerMinute: ratePerMinute,
        };

        // Enrich with contact info
        const contactPhone = callRecord.direction === 'outgoing' ? To : From;
        const contact = await db.getContactByPhone(user.id, contactPhone);
        if (contact) {
          callRecord.contactName = contact.name;
          callRecord.contactId = contact.id;
        }

        await db.createCallRecord(callRecord);

        // Deduct cost and update duration
        const newBalance = Math.max(0, user.balance - cost);
        await db.updateUserBalance(user.id, newBalance);

        const durationMinutes = Math.ceil(duration / 60);
        const newTotalDuration = user.totalCallDuration + durationMinutes;
        await db.updateUser(user.id, { totalCallDuration: newTotalDuration });

        logger.info('Call record created from callback', {
          userId: user.id,
          callSid: CallSid,
          duration,
          cost,
        });
      }
    }

    // Handle failed/busy/no-answer calls
    if (['failed', 'busy', 'no-answer'].includes(CallStatus)) {
      const existingCall = await db.getCallByCallSid(CallSid);

      if (existingCall) {
        await db.updateCallRecord(CallSid, {
          status: CallStatus as any,
          endTime: new Date(),
        });

        logger.info('Call status updated to failed state', {
          userId: user.id,
          callSid: CallSid,
          status: CallStatus,
        });
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    logger.error('Error handling status callback:', error);
    return res.sendStatus(500);
  }
});

export default router;
