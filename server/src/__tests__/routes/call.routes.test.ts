import request from 'supertest';
import app from '../../app';

// Mock the Twilio service
jest.mock('../../services/twilio.service', () => ({
  twilioService: {
    makeCall: jest.fn().mockResolvedValue({
      callSid: 'CA123456789',
      status: 'initiated',
      direction: 'outbound-api',
      from: '+19191234567',
      to: '+254712345678',
      dateCreated: new Date(),
      estimatedCostPerMinute: 0.05,
    }),
    getRateForDestination: jest.fn((phone: string) => {
      return phone.startsWith('+254') ? 0.05 : 0.10;
    }),
    getCallDetails: jest.fn().mockResolvedValue({
      callSid: 'CA123456789',
      status: 'completed',
      duration: 120,
      from: '+19191234567',
      to: '+254712345678',
    }),
  },
}));

describe('Call Routes', () => {
  const testUserId = '1';

  describe('POST /api/calls', () => {
    test('should initiate outbound call', async () => {
      const callParams = {
        to: '+254712345678',
        from: '+19191234567',
      };

      const response = await request(app)
        .post('/api/calls')
        .send(callParams)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('callSid');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data.to).toBe(callParams.to);
      expect(response.body.data.from).toBe(callParams.from);
    });

    test('should reject call without destination', async () => {
      await request(app)
        .post('/api/calls')
        .send({ from: '+19191234567' })
        .expect(400);
    });

    test('should reject call without caller', async () => {
      await request(app)
        .post('/api/calls')
        .send({ to: '+254712345678' })
        .expect(400);
    });
  });

  describe('GET /api/calls/pricing/:phoneNumber', () => {
    test('should return Kenya rate for Kenyan number', async () => {
      const response = await request(app)
        .get('/api/calls/pricing/+254712345678')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ratePerMinute).toBe(0.05);
      expect(response.body.data.currency).toBe('USD');
    });

    test('should return default rate for other numbers', async () => {
      const response = await request(app)
        .get('/api/calls/pricing/+15551234567')
        .expect(200);

      expect(response.body.data.ratePerMinute).toBe(0.10);
    });
  });

  describe('POST /api/calls/history', () => {
    test('should save call history record', async () => {
      const callRecord = {
        callSid: `CA${Date.now()}`,
        from: '+19191234567',
        to: '+254712345678',
        direction: 'outgoing',
        status: 'completed',
        date: new Date().toISOString(),
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 120000).toISOString(),
        duration: 120,
        cost: 0.10,
        ratePerMinute: 0.05,
      };

      const response = await request(app)
        .post('/api/calls/history')
        .query({ userId: testUserId })
        .send(callRecord)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        callSid: callRecord.callSid,
        from: callRecord.from,
        to: callRecord.to,
        direction: callRecord.direction,
        status: callRecord.status,
        duration: callRecord.duration,
        cost: callRecord.cost,
      });
    });

    test('should enrich call record with contact name', async () => {
      const callRecord = {
        callSid: `CA${Date.now()}`,
        from: '+19191234567',
        to: '+254712345678', // Alice Johnson
        direction: 'outgoing',
        status: 'completed',
        date: new Date().toISOString(),
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 60000).toISOString(),
        duration: 60,
        cost: 0.05,
        ratePerMinute: 0.05,
      };

      const response = await request(app)
        .post('/api/calls/history')
        .query({ userId: testUserId })
        .send(callRecord)
        .expect(201);

      expect(response.body.data).toHaveProperty('contactName');
      expect(response.body.data).toHaveProperty('contactId');
    });

    test('should deduct cost from user balance', async () => {
      // Get current balance
      const userResponse = await request(app).get('/api/users/1');
      const initialBalance = userResponse.body.data.balance;

      const callCost = 0.25;
      const callRecord = {
        callSid: `CA${Date.now()}`,
        from: '+19191234567',
        to: '+254712345678',
        direction: 'outgoing',
        status: 'completed',
        date: new Date().toISOString(),
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 300000).toISOString(),
        duration: 300,
        cost: callCost,
        ratePerMinute: 0.05,
      };

      await request(app)
        .post('/api/calls/history')
        .query({ userId: testUserId })
        .send(callRecord)
        .expect(201);

      // Check updated balance
      const updatedUserResponse = await request(app).get('/api/users/1');
      const newBalance = updatedUserResponse.body.data.balance;

      expect(newBalance).toBe(Math.max(0, initialBalance - callCost));
    });
  });

  describe('GET /api/calls/history', () => {
    test('should get call history for user', async () => {
      const response = await request(app)
        .get('/api/calls/history')
        .query({ userId: testUserId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should respect limit parameter', async () => {
      const limit = 5;
      const response = await request(app)
        .get('/api/calls/history')
        .query({ userId: testUserId, limit })
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(limit);
    });

    test('should sort history by date descending', async () => {
      const response = await request(app)
        .get('/api/calls/history')
        .query({ userId: testUserId })
        .expect(200);

      const history = response.body.data;
      if (history.length > 1) {
        for (let i = 1; i < history.length; i++) {
          const prevDate = new Date(history[i - 1].date).getTime();
          const currDate = new Date(history[i].date).getTime();
          expect(prevDate).toBeGreaterThanOrEqual(currDate);
        }
      }
    });
  });

  describe('GET /api/calls/history/contact/:phone', () => {
    test('should get call history for specific contact', async () => {
      const contactPhone = '+254712345678';

      const response = await request(app)
        .get(`/api/calls/history/contact/${contactPhone}`)
        .query({ userId: testUserId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      response.body.data.forEach((call: any) => {
        expect(
          call.from === contactPhone || call.to === contactPhone
        ).toBe(true);
      });
    });

    test('should return empty array for contact with no history', async () => {
      const response = await request(app)
        .get('/api/calls/history/contact/+254799999999')
        .query({ userId: testUserId })
        .expect(200);

      expect(response.body.data).toEqual([]);
    });
  });
});