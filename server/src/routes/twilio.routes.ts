import express, { Request, Response } from 'express';
import twilio from 'twilio';

const router = express.Router();

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_TWIML_APP_SID,
} = process.env;

// ============================================
// 1. GENERATE ACCESS TOKEN (Simplified)
// ============================================
router.post('/token', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Create access token using Account SID/Auth Token
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const token = new AccessToken(
      TWILIO_ACCOUNT_SID!,
      TWILIO_ACCOUNT_SID!,  // Use Account SID as API Key for testing
      TWILIO_AUTH_TOKEN!,   // Use Auth Token as API Secret for testing
      {
        identity: userId,
        ttl: 3600, // 1 hour
      }
    );

    // Create Voice grant
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: TWILIO_TWIML_APP_SID,
      incomingAllow: true,
    });

    token.addGrant(voiceGrant);

    res.json({
      token: token.toJwt(),
      identity: userId,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// ============================================
// 2. VOICE WEBHOOK - OUTBOUND CALLS
// ============================================
router.post('/voice', (req: Request, res: Response) => {
  const { To, From } = req.body;

  console.log(`Outbound call: ${From} -> ${To}`);

  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();

  // Dial the number
  const dial = response.dial({
    callerId: From,
    timeout: 30,
    record: 'record-from-answer',
  });

  dial.number(To);

  res.type('text/xml');
  res.send(response.toString());
});

// ============================================
// 3. INCOMING CALL WEBHOOK
// ============================================
router.post('/incoming', (req: Request, res: Response) => {
  const { From, To } = req.body;

  console.log(`Incoming call: ${From} -> ${To}`);

  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();

  const dial = response.dial({
    timeout: 30,
    record: 'record-from-answer',
  });

  // Get the user identity from your database based on 'To' number
  const userId = 'user-123'; // TODO: Lookup from database
  dial.client(userId);

  res.type('text/xml');
  res.send(response.toString());
});

// ============================================
// 4. CALL STATUS WEBHOOK
// ============================================
router.post('/status', async (req: Request, res: Response) => {
  const {
    CallSid,
    CallStatus,
    CallDuration,
    From,
    To,
    RecordingUrl,
    RecordingSid,
  } = req.body;

  console.log(`Call status update: ${CallSid} - ${CallStatus}`);

  try {
    // TODO: Save to database
    res.status(200).send('OK');
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).send('Error');
  }
});

// ============================================
// 5. RECORDING STATUS WEBHOOK
// ============================================
router.post('/recording-status', async (req: Request, res: Response) => {
  const {
    CallSid,
    RecordingSid,
    RecordingUrl,
    RecordingDuration,
    RecordingStatus,
  } = req.body;

  console.log(`Recording status: ${RecordingSid} - ${RecordingStatus}`);

  // TODO: Save recording metadata to database
  res.status(200).send('OK');
});

// ============================================
// 6. GET CALL HISTORY
// ============================================
router.get('/calls/history', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Mock response for now
    type CallHistory = {
      sid: string;
      from: string;
      to: string;
      status: string;
      duration?: number;
      recordingUrl?: string;
    };

    const calls: CallHistory[] = [];

    res.json({ calls, total: calls.length, limit, offset });
  } catch (error) {
    console.error('Call history error:', error);
    res.status(500).json({ error: 'Failed to fetch call history' });
  }
});

// ============================================
// 7. GET PRICING
// ============================================
router.get('/pricing/:countryCode', async (req: Request, res: Response) => {
  try {
    const { countryCode } = req.params;

    const client = twilio(TWILIO_ACCOUNT_SID!, TWILIO_AUTH_TOKEN!);

    const pricing = await client.pricing.v1
      .voice
      .countries(countryCode.toUpperCase())
      .fetch();

    res.json({
      country: pricing.country,
      countryCode: pricing.isoCountry,
      priceUnit: pricing.priceUnit,
      outboundRates: pricing.outboundPrefixPrices.map(rate => ({
        prefix: rate.prefixes?.[0] ?? '',
        currentPrice: rate.currentPrice,
        basePrice: rate.basePrice,
      })),
    });
  } catch (error) {
    console.error('Pricing fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch pricing' });
  }
});

export default router;
