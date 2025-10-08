import express from 'express';
import cors from 'cors';
import twilioRoutes from './routes/twilio.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/twilio', twilioRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📞 Twilio webhooks: http://localhost:${PORT}/api/twilio`);
});

// Environment variables required:
// TWILIO_ACCOUNT_SID=your_account_sid
// TWILIO_AUTH_TOKEN=your_auth_token
// TWILIO_TWIML_APP_SID=your_twiml_app_sid
// TWILIO_API_KEY=your_api_key
// TWILIO_API_SECRET=your_api_secret