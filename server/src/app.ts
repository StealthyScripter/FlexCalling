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
app.get('/health', (_req: Request, res: Response) => {  // Use _req to indicate unused
  return res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

app.get('/health/db', (_req: Request, res: Response) => {
  try {
    const stats = {
      users: db.getUser('1') ? 1 : 0,
      contacts: db.getContacts('1').length,
      callLogs: db.getCallHistory('1').length,
    };

    return res.json({
      status: 'ok',
      database: 'connected',
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
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
app.use((_req: Request, res: Response) => {  // Use _req to indicate unused
  return res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {  // Use _ prefix
  console.error('Error:', err);

  return res.status(500).json({
    success: false,
    error: config.nodeEnv === 'development' ? err.message : 'Internal server error',
  });
});

export default app;
