import request from 'supertest';
import app from '../../app';

describe('Voice Routes', () => {
  describe('POST /api/voice/twiml', () => {
    test('should generate TwiML for call', async () => {
      const response = await request(app)
        .post('/api/voice/twiml')
        .send({ To: '+254712345678' })
        .expect(200);

      expect(response.type).toBe('text/xml');
      expect(response.text).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(response.text).toContain('<Response>');
      expect(response.text).toContain('<Dial');
      expect(response.text).toContain('+254712345678');
    });

    test('should return 400 without destination', async () => {
      await request(app)
        .post('/api/voice/twiml')
        .send({})
        .expect(400);
    });

    test('should include caller ID in TwiML', async () => {
      const response = await request(app)
        .post('/api/voice/twiml')
        .send({ To: '+254712345678' })
        .expect(200);

      expect(response.text).toContain('callerId=');
    });
  });

  describe('POST /api/voice/status', () => {
    test('should handle call status callback', async () => {
      const statusData = {
        CallSid: 'CA123456789',
        CallStatus: 'completed',
        CallDuration: '120',
        From: '+19191234567',
        To: '+254712345678',
      };

      await request(app)
        .post('/api/voice/status')
        .send(statusData)
        .expect(200);
    });

    test('should handle in-progress status', async () => {
      const statusData = {
        CallSid: 'CA123456789',
        CallStatus: 'in-progress',
        From: '+19191234567',
        To: '+254712345678',
      };

      await request(app)
        .post('/api/voice/status')
        .send(statusData)
        .expect(200);
    });

    test('should handle failed status', async () => {
      const statusData = {
        CallSid: 'CA123456789',
        CallStatus: 'failed',
        From: '+19191234567',
        To: '+254712345678',
      };

      await request(app)
        .post('/api/voice/status')
        .send(statusData)
        .expect(200);
    });
  });
});
