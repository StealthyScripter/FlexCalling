import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config, validateConfig } from './config';
import { db } from './services/database.service';

// Import routes
import tokenRoutes from './routes/token.routes';
import userRoutes from './routes/user.routes';
import contactRoutes from './routes/contact.routes';
import callRoutes from './routes/call.routes';
import voiceRoutes from './routes/voice.routes';

// Validate configuration
validateConfig();

const app: Application = express();

// ============================================
// MIDDLEWARE
// ============================================

// Security
app.use(helmet());

// CORS
app.use(cors({
  origin: config.nodeEnv === 'development' ? '*' : ['http://localhost:8081'],
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (_req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

app.get('/health/db', async (_req: Request, res: Response) => {
  try {
    const isHealthy = await db.healthCheck();

    if (!isHealthy) {
      return res.status(503).json({
        status: 'error',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }

    const user = await db.getUser('1');
    const contacts = await db.getContacts('1');
    const callLogs = await db.getCallHistory('1', 10);

    return res.json({
      status: 'ok',
      database: 'connected',
      stats: {
        users: user ? 1 : 0,
        contacts: contacts.length,
        callLogs: callLogs.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      database: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// API routes
app.use('/api/token', tokenRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/voice', voiceRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  return res.status(500).json({
    success: false,
    error: config.nodeEnv === 'development' ? err.message : 'Internal server error',
  });
});

export default app;
