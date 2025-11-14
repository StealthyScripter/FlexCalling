import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config, validateConfig } from './config';
import { db } from './services/database.service';
import { logger } from './services/logger.service';

// Import middleware
import { apiLimiter } from './middleware/rateLimiting.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import tokenRoutes from './routes/token.routes';
import userRoutes from './routes/user.routes';
import contactRoutes from './routes/contact.routes';
import callRoutes from './routes/call.routes';
import voiceRoutes from './routes/voice.routes';
import adminRoutes from './routes/admin.routes'; // NEW

// Validate configuration
validateConfig();

const app: Application = express();

// ============================================
// MIDDLEWARE
// ============================================

// Security
app.use(helmet());
app.use(errorHandler);
app.use(notFoundHandler);


// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }));
}

// Rate limiting (apply to all routes)
if (config.rateLimiting.enabled) {
  app.use('/api/', apiLimiter);
}

// ============================================
// ROUTES
// ============================================

// Health check (no auth required)
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

    return res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    return res.status(500).json({
      status: 'error',
      database: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/admin', adminRoutes); // NEW - Admin routes

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
