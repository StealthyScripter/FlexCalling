import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

import express from 'express';
import cors from 'cors';
import twilioRoutes from './routes/twilio.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// ✅ FIX: CORS - Allow all origins for development
app.use(cors({
  origin: '*', // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/twilio', twilioRoutes);

// Health check
app.get('/health', (req, res) => {
  console.log('✅ Health check called');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    twilioConfigured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  console.log('✅ Test endpoint called');
  res.json({ message: 'Server is working!' });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📞 Twilio webhooks: http://localhost:${PORT}/api/twilio`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);

  // Verify Twilio configuration
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn('⚠️  WARNING: Twilio credentials not configured!');
  } else {
    console.log('✅ Twilio credentials loaded successfully');
    console.log(`   Account SID: ${process.env.TWILIO_ACCOUNT_SID.slice(0, 10)}...`);
  }

  if (!process.env.TWILIO_TWIML_APP_SID) {
    console.warn('⚠️  WARNING: TWILIO_TWIML_APP_SID not configured!');
  } else {
    console.log('✅ TwiML App SID configured');
    console.log(`   TwiML App: ${process.env.TWILIO_TWIML_APP_SID.slice(0, 10)}...`);
  }

  console.log('🎉 Server is ready and listening for requests!');
  console.log('🌐 CORS enabled for all origins');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
  });
});
