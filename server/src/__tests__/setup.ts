// Mock environment variables BEFORE importing config
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.TWILIO_ACCOUNT_SID = 'ACtest123456789';
process.env.TWILIO_AUTH_TOKEN = 'test_auth_token';
process.env.TWILIO_API_KEY = 'SKtest123456789';
process.env.TWILIO_API_SECRET = 'test_api_secret';
process.env.TWILIO_TWIML_APP_SID = 'APtest123456789';
process.env.TWILIO_PHONE_NUMBER = '+19191234567';

import { config, validateConfig } from '../config';

// Validate configuration
validateConfig();

// Increase timeout for integration tests
jest.setTimeout(10000);

// Global test utilities
export const mockUser = {
  id: 'test-user-1',
  name: 'Test User',
  phone: '+19191234567',
  email: 'test@example.com',
  balance: 50.0,
};

export const mockContact = {
  id: 'test-contact-1',
  name: 'Test Contact',
  phone: '+254712345678',
  email: 'contact@example.com',
  location: 'Nairobi, Kenya',
  favorite: false,
  avatarColor: '#EC4899',
};

export const mockCallRecord = {
  id: 'test-call-1',
  callSid: 'CA123456789',
  from: '+19191234567',
  to: '+254712345678',
  direction: 'outgoing' as const,
  status: 'completed' as const,
  date: new Date(),
  startTime: new Date(),
  endTime: new Date(),
  duration: 120,
  cost: 0.10,
  ratePerMinute: 0.05,
};

// Suppress console warnings in tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
});

// Use config to avoid unused variable warning
if (config.nodeEnv === 'test') {
  console.log('Test environment initialized');
}