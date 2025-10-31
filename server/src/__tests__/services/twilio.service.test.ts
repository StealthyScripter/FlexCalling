// Mock Twilio BEFORE importing the service
const mockToJwt = jest.fn().mockReturnValue('mock.jwt.token');
const mockAddGrant = jest.fn();

const mockAccessTokenConstructor = jest.fn().mockImplementation(() => ({
  identity: '',
  addGrant: mockAddGrant,
  toJwt: mockToJwt,
}));

const mockVoiceGrantConstructor = jest.fn().mockImplementation(() => ({
  outgoingApplicationSid: '',
  incomingAllow: true,
}));

// Assign VoiceGrant to AccessToken
(mockAccessTokenConstructor as any).VoiceGrant = mockVoiceGrantConstructor;

const mockCalls = {
  create: jest.fn().mockResolvedValue({
    sid: 'CA123456789',
    status: 'initiated',
    direction: 'outbound-api',
    from: '+19191234567',
    to: '+254712345678',
    dateCreated: new Date(),
  }),
  list: jest.fn().mockResolvedValue([]),
};

jest.mock('twilio', () => {
  return jest.fn().mockImplementation(() => ({
    calls: mockCalls,
  }));
});

// Mock the jwt module separately
jest.mock('twilio', () => {
  const mockTwilio = jest.fn().mockImplementation(() => ({
    calls: mockCalls,
  }));

  (mockTwilio as any).jwt = {
    AccessToken: mockAccessTokenConstructor,
  };

  return mockTwilio;
});

import { twilioService } from '../../services/twilio.service';

describe('TwilioService', () => {
  describe('generateAccessToken', () => {
    test('should generate access token with identity', () => {
      const identity = 'user_123';
      const tokenData = twilioService.generateAccessToken(identity);

      expect(tokenData).toHaveProperty('token');
      expect(tokenData).toHaveProperty('identity', identity);
      expect(tokenData).toHaveProperty('expiresAt');
      expect(tokenData.token).toBeTruthy();
      expect(tokenData.expiresAt instanceof Date).toBe(true);
    });

    test('should generate different tokens for different identities', () => {
      const token1 = twilioService.generateAccessToken('user_1');
      const token2 = twilioService.generateAccessToken('user_2');

      expect(token1.identity).not.toBe(token2.identity);
    });

    test('should set expiration 1 hour in future', () => {
      const tokenData = twilioService.generateAccessToken('user_123');
      const now = Date.now();
      const expiresAt = tokenData.expiresAt.getTime();
      const oneHour = 60 * 60 * 1000;

      expect(expiresAt).toBeGreaterThan(now);
      expect(expiresAt).toBeLessThanOrEqual(now + oneHour + 1000);
    });
  });

  describe('getRateForDestination', () => {
    test('should return Kenya rate for Kenyan numbers', () => {
      const rate = twilioService.getRateForDestination('+254712345678');
      expect(rate).toBe(0.05);
    });

    test('should return default rate for other numbers', () => {
      const rate = twilioService.getRateForDestination('+15551234567');
      expect(rate).toBe(0.10);
    });

    test('should handle different Kenya number formats', () => {
      const numbers = ['+254712345678', '+254722345678', '+254734345678'];

      numbers.forEach(number => {
        const rate = twilioService.getRateForDestination(number);
        expect(rate).toBe(0.05);
      });
    });
  });

  describe('generateTwiML', () => {
    test('should generate valid TwiML for outbound call', () => {
      const to = '+254712345678';
      const twiml = twilioService.generateTwiML(to);

      expect(twiml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(twiml).toContain('<Response>');
      expect(twiml).toContain('<Dial');
      expect(twiml).toContain(`<Number>${to}</Number>`);
      expect(twiml).toContain('</Response>');
    });

    test('should include caller ID in TwiML', () => {
      const to = '+254712345678';
      const twiml = twilioService.generateTwiML(to);

      expect(twiml).toContain('callerId=');
    });
  });
});