import { Router, Request, Response } from 'express';
import { twilioService } from '../services/twilio.service';

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
    return res.send(twiml);  // ADD return
  } catch (error) {
    console.error('Error generating TwiML:', error);
    return res.status(500).send('Error generating TwiML');
  }
});

/**
 * POST /api/voice/status
 * Handle call status callbacks from Twilio
 */
router.post('/status', (req: Request, res: Response) => {
  try {
    const {
      CallSid,
      CallStatus,
      CallDuration,
      From,
      To,
    } = req.body;

    console.log('📞 Call status update:', {
      callSid: CallSid,
      status: CallStatus,
      duration: CallDuration,
      from: From,
      to: To,
    });

    // Here you would typically:
    // 1. Update call record in database
    // 2. Calculate final cost
    // 3. Update user balance
    // 4. Send push notification to user

    return res.sendStatus(200);  // ADD return
  } catch (error) {
    console.error('Error handling status callback:', error);
    return res.sendStatus(500);
  }
});

export default router;
