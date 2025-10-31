import twilio from 'twilio';
import { config } from '../config';
import type { TwilioTokenResponse, MakeCallRequest, MakeCallResponse } from '../types';

const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

export class TwilioService {
  private client: twilio.Twilio | null;
  private isMockMode: boolean;

  constructor() {
    // Use mock mode if credentials are not provided OR invalid
    const hasValidCredentials =
      config.twilio.accountSid &&
      config.twilio.authToken &&
      config.twilio.accountSid.startsWith('AC');

    this.isMockMode = !hasValidCredentials;

    if (this.isMockMode) {
      console.log('🔧 Running in MOCK mode - Twilio credentials not configured');
      this.client = null;
    } else {
      try {
        this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
        console.log('✅ Twilio client initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Twilio client:', error);
        this.isMockMode = true;
        this.client = null;
      }
    }
  }

  /**
   * Generate Twilio access token for Voice SDK
   */
  generateAccessToken(identity: string): TwilioTokenResponse {
    if (this.isMockMode) {
      return {
        token: `mock-token-${Date.now()}`,
        identity,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      };
    }

    const token = new AccessToken(
      config.twilio.accountSid,
      config.twilio.apiKey,
      config.twilio.apiSecret,
      { identity, ttl: 3600 } // 1 hour
    );

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: config.twilio.twimlAppSid,
      incomingAllow: true,
    });

    token.addGrant(voiceGrant);

    return {
      token: token.toJwt(),
      identity,
      expiresAt: new Date(Date.now() + 3600000),
    };
  }

  /**
   * Make an outbound call
   */
  async makeCall(params: MakeCallRequest): Promise<MakeCallResponse> {
    if (this.isMockMode) {
      return {
        callSid: `CA${Date.now()}`,
        status: 'initiated',
        direction: 'outbound-api',
        from: params.from,
        to: params.to,
        dateCreated: new Date(),
        estimatedCostPerMinute: this.getRateForDestination(params.to),
      };
    }

    const call = await this.client!.calls.create({
      to: params.to,
      from: params.from,
      url: `${process.env.BASE_URL || 'http://localhost:3000'}/api/voice/twiml`,
    });

    return {
      callSid: call.sid,
      status: call.status,
      direction: call.direction,
      from: call.from,
      to: call.to,
      dateCreated: new Date(call.dateCreated),
      estimatedCostPerMinute: this.getRateForDestination(params.to),
    };
  }

  /**
   * Get call details
   */
  async getCallDetails(callSid: string) {
    if (this.isMockMode) {
      return {
        callSid,
        status: 'completed',
        duration: 120,
        from: '+1234567890',
        to: '+254712345678',
      };
    }

    const call = await this.client!.calls(callSid).fetch();
    return {
      callSid: call.sid,
      status: call.status,
      duration: parseInt(call.duration || '0'),
      from: call.from,
      to: call.to,
    };
  }

  /**
   * Get pricing rate for destination
   */
  getRateForDestination(phoneNumber: string): number {
    // Kenya numbers start with +254
    if (phoneNumber.startsWith('+254')) {
      return config.pricing.kenyaRate;
    }
    return config.pricing.defaultRate;
  }

  /**
   * Generate TwiML for call handling
   */
  generateTwiML(to: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${config.twilio.phoneNumber}">
    <Number>${to}</Number>
  </Dial>
</Response>`;
  }
}

export const twilioService = new TwilioService();
