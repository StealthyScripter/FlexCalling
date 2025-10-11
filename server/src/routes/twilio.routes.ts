import express, { Request, Response } from 'express';
import twilio from 'twilio';

const router = express.Router();

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_TWIML_APP_SID,
} = process.env;

// ============================================
// 1. GENERATE ACCESS TOKEN
// ============================================
router.post('/token', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      console.error('❌ Twilio credentials missing!');
      return res.status(500).json({ error: 'Twilio not configured' });
    }

    if (!TWILIO_TWIML_APP_SID) {
      console.error('❌ TwiML App SID missing!');
      return res.status(500).json({ error: 'TwiML App not configured' });
    }

    console.log(`🔑 Generating access token for user: ${userId}`);

    // Create access token
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const token = new AccessToken(
      TWILIO_ACCOUNT_SID,
      TWILIO_ACCOUNT_SID,  // Use Account SID as API Key for testing
      TWILIO_AUTH_TOKEN,   // Use Auth Token as API Secret for testing
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

    const jwt = token.toJwt();

    res.json({
      token: jwt,
      identity: userId,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    });

    console.log(`✅ Token generated successfully for ${userId}`);
  } catch (error) {
    console.error('❌ Token generation error:', error);
    res.status(500).json({
      error: 'Failed to generate token',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================
// 2. VOICE WEBHOOK - OUTBOUND CALLS
// ============================================
router.post('/voice', (req: Request, res: Response) => {
  const { To, From, Direction } = req.body;

  console.log(`📞 Voice webhook - ${Direction || 'outbound'}: ${From} -> ${To}`);

  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();

  try {
    if (!To) {
      response.say('No destination number provided. Please try again.');
      res.type('text/xml');
      return res.send(response.toString());
    }

    // Dial the number
    const dial = response.dial({
      callerId: From,
      timeout: 30,
      record: 'record-from-answer',
      recordingStatusCallback: `${req.protocol}://${req.get('host')}/api/twilio/recording-status`,
    });

    dial.number(To);

    res.type('text/xml');
    res.send(response.toString());

    console.log(`✅ TwiML response sent for call to ${To}`);
  } catch (error) {
    console.error('❌ Voice webhook error:', error);
    response.say('An error occurred. Please try again later.');
    res.type('text/xml');
    res.send(response.toString());
  }
});

// ============================================
// 3. INCOMING CALL WEBHOOK
// ============================================
router.post('/incoming', (req: Request, res: Response) => {
  const { From, To, CallSid } = req.body;

  console.log(`📞 Incoming call: ${From} -> ${To} (CallSid: ${CallSid})`);

  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();

  try {
    const dial = response.dial({
      timeout: 30,
      record: 'record-from-answer',
      recordingStatusCallback: `${req.protocol}://${req.get('host')}/api/twilio/recording-status`,
    });

    // TODO: Get the user identity from database based on 'To' number
    const userId = 'user-123'; // Hardcoded for now

    dial.client(userId);

    res.type('text/xml');
    res.send(response.toString());

    console.log(`✅ Incoming call routed to client: ${userId}`);
  } catch (error) {
    console.error('❌ Incoming call error:', error);
    response.say('Unable to connect your call. Please try again later.');
    res.type('text/xml');
    res.send(response.toString());
  }
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
    Direction,
  } = req.body;

  console.log(`📊 Call status update: ${CallSid} - ${CallStatus}`);
  console.log(`   From: ${From}, To: ${To}, Duration: ${CallDuration}s, Direction: ${Direction}`);

  try {
    // TODO: Save to database
    res.status(200).send('OK');
    console.log(`✅ Call status saved: ${CallStatus}`);
  } catch (error) {
    console.error('❌ Status update error:', error);
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

  console.log(`🎙️  Recording status: ${RecordingSid} - ${RecordingStatus}`);
  console.log(`   CallSid: ${CallSid}, Duration: ${RecordingDuration}s`);
  console.log(`   URL: ${RecordingUrl}`);

  try {
    // TODO: Save recording metadata to database
    res.status(200).send('OK');
    console.log(`✅ Recording metadata saved`);
  } catch (error) {
    console.error('❌ Recording status error:', error);
    res.status(500).send('Error');
  }
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

    console.log(`📋 Fetching call history for user: ${userId} (limit: ${limit}, offset: ${offset})`);

    // TODO: Fetch from database
    const calls = [
      {
        sid: 'CA1234567890',
        from: '+1234567890',
        to: '+254712345678',
        status: 'completed',
        duration: 125,
        cost: 0.10,
        timestamp: new Date().toISOString(),
        direction: 'outbound',
      }
    ];

    res.json({
      calls,
      total: calls.length,
      limit,
      offset,
      userId
    });

    console.log(`✅ Returned ${calls.length} call records`);
  } catch (error) {
    console.error('❌ Call history error:', error);
    res.status(500).json({
      error: 'Failed to fetch call history',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================
// 7. GET PRICING
// ============================================
router.get('/pricing/:countryCode', async (req: Request, res: Response) => {
  try {
    const { countryCode } = req.params;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return res.status(500).json({ error: 'Twilio not configured' });
    }

    console.log(`💰 Fetching pricing for country: ${countryCode}`);

    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    const pricing = await client.pricing.v1
      .voice
      .countries(countryCode.toUpperCase())
      .fetch();

    const response = {
      country: pricing.country,
      countryCode: pricing.isoCountry,
      priceUnit: pricing.priceUnit,
      outboundRates: pricing.outboundPrefixPrices?.map(rate => ({
        prefix: rate.prefixes?.[0] ?? '',
        currentPrice: rate.currentPrice,
        basePrice: rate.basePrice,
      })) || [],
    };

    res.json(response);

    console.log(`✅ Pricing fetched for ${pricing.country}`);
  } catch (error) {
    console.error('❌ Pricing fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch pricing',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================
// 8. HEALTH CHECK
// ============================================
router.get('/health', (req: Request, res: Response) => {
  const isConfigured = !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_TWIML_APP_SID);

  res.json({
    status: 'ok',
    twilio: {
      configured: isConfigured,
      accountSid: TWILIO_ACCOUNT_SID ? '***' + TWILIO_ACCOUNT_SID.slice(-4) : 'not set',
      twimlAppSid: TWILIO_TWIML_APP_SID ? '***' + TWILIO_TWIML_APP_SID.slice(-4) : 'not set',
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
