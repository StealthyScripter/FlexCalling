import type { Request, Response, NextFunction } from 'express';
import twilio from 'twilio';
import { logger } from '../services/logger.service';

export const twilioWebhookAuth = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers['x-twilio-signature'] as string | undefined;

  if (!signature) {
    logger.warn('Missing Twilio signature on webhook', {
      url: req.originalUrl,
      ip: req.ip,
    });
    return res.status(403).send('Missing Twilio signature');
  }

  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const publicBaseUrl = process.env.PUBLIC_BASE_URL; // e.g. https://your-domain.com

  if (!authToken || !publicBaseUrl) {
    logger.error('Twilio webhook misconfigured: missing AUTH TOKEN or PUBLIC_BASE_URL');
    return res.status(500).send('Twilio webhook not configured properly');
  }

  // Full URL Twilio used
  const url = `${publicBaseUrl}${req.originalUrl}`;

  const isValid = twilio.validateRequest(authToken, signature, url, req.body);

  if (!isValid) {
    logger.warn('Invalid Twilio signature', {
      url: req.originalUrl,
      ip: req.ip,
    });
    return res.status(403).send('Invalid Twilio signature');
  }

  return next();
};
