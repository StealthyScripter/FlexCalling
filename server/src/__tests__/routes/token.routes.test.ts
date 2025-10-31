import request from 'supertest';
import app from '../../app';

describe('Token Routes', () => {
  describe('GET /api/token', () => {
    test('should return access token for default user', async () => {
      const response = await request(app)
        .get('/api/token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('identity');
      expect(response.body.data).toHaveProperty('expiresAt');
      expect(response.body.data.identity).toBe('user_1');
    });

    test('should return access token for specific user', async () => {
      const response = await request(app)
        .get('/api/token')
        .query({ userId: '123' })
        .expect(200);

      expect(response.body.data.identity).toBe('user_123');
    });

    test('should return valid token format', async () => {
      const response = await request(app)
        .get('/api/token')
        .expect(200);

      const token = response.body.data.token;
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    test('should set future expiration date', async () => {
      const response = await request(app)
        .get('/api/token')
        .expect(200);

      const expiresAt = new Date(response.body.data.expiresAt);
      const now = new Date();

      expect(expiresAt.getTime()).toBeGreaterThan(now.getTime());
    });
  });
});