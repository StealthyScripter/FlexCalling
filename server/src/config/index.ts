import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // Twilio credentials
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    apiKey: process.env.TWILIO_API_KEY || '',
    apiSecret: process.env.TWILIO_API_SECRET || '',
    twimlAppSid: process.env.TWILIO_TWIML_APP_SID || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },

  // Pricing
  pricing: {
    kenyaRate: 0.05, // $0.05 per minute to Kenya
    defaultRate: 0.10, // $0.10 per minute default
  },

  // Security
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10'),

  // Rate Limiting
  rateLimiting: {
    enabled: process.env.RATE_LIMITING_ENABLED !== 'false',
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
};

// Validate required config
export function validateConfig() {
  const required = [
    'JWT_SECRET',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_API_KEY',
    'TWILIO_API_SECRET',
    'TWILIO_TWIML_APP_SID',
    'TWILIO_PHONE_NUMBER',
  ];

  const missing: string[] = [];

  // Check JWT secret in production
  if (config.nodeEnv === 'production' && !process.env.JWT_SECRET) {
    missing.push('JWT_SECRET');
  }

  // Check Twilio credentials
  required.forEach((key) => {
    if (key !== 'JWT_SECRET' && !process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0 && config.nodeEnv === 'production') {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }

  if (missing.length > 0) {
    console.warn('⚠️  Missing environment variables:', missing.join(', '));
    console.warn('⚠️  App will run in mock mode for development');
  }
}
