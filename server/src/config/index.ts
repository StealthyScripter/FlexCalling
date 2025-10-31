import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

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
};

// Validate required config
export function validateConfig() {
  const required = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_API_KEY',
    'TWILIO_API_SECRET',
    'TWILIO_TWIML_APP_SID',
    'TWILIO_PHONE_NUMBER',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn('⚠️  Missing environment variables:', missing.join(', '));
    console.warn('⚠️  App will run in mock mode for development');
  }
}