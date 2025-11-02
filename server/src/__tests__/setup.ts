// Mock environment variables BEFORE importing config
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DATABASE_URL = 'postgresql://flexcalling:flexcalling_dev_password@localhost:5432/flexcalling_test?schema=public';
process.env.TWILIO_ACCOUNT_SID = 'ACtest123456789';
process.env.TWILIO_AUTH_TOKEN = 'test_auth_token';
process.env.TWILIO_API_KEY = 'SKtest123456789';
process.env.TWILIO_API_SECRET = 'test_api_secret';
process.env.TWILIO_TWIML_APP_SID = 'APtest123456789';
process.env.TWILIO_PHONE_NUMBER = '+19191234567';

import { config, validateConfig } from '../config';
import { db, prisma } from '../services/database.service';

// Validate configuration
validateConfig();

// Increase timeout for integration tests
jest.setTimeout(30000);

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

// Setup and teardown for database
beforeAll(async () => {
  // Connect to test database
  await db.connect();
});

afterAll(async () => {
  // Clean up and disconnect
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "users" CASCADE');
  await db.disconnect();
});

// Clean database between tests (optional, depending on test strategy)
beforeEach(async () => {
  // You can implement per-test cleanup if needed
  // await prisma.callHistory.deleteMany();
  // await prisma.contact.deleteMany();
  // await prisma.user.deleteMany();
});

// Suppress console warnings in tests
const originalWarn = console.warn;
const originalLog = console.log;

beforeAll(() => {
  console.warn = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
  console.log = originalLog;
});

// Use config to avoid unused variable warning
if (config.nodeEnv === 'test') {
  // Test environment initialized
}
