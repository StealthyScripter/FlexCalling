import request from 'supertest';
import app from '../../app';

describe('User Routes', () => {
  describe('GET /api/users/:userId', () => {
    test('should get user profile', async () => {
      const response = await request(app)
        .get('/api/users/1')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', '1');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('phone');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('balance');
    });

    test('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/users/:userId', () => {
    test('should update user profile', async () => {
      const updates = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const response = await request(app)
        .put('/api/users/1')
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updates.name);
      expect(response.body.data.email).toBe(updates.email);
    });

    test('should return 404 when updating non-existent user', async () => {
      await request(app)
        .put('/api/users/non-existent')
        .send({ name: 'Test' })
        .expect(404);
    });
  });

  describe('PUT /api/users/:userId/balance', () => {
    test('should update user balance', async () => {
      const newBalance = 100.0;

      const response = await request(app)
        .put('/api/users/1/balance')
        .send({ balance: newBalance })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.balance).toBe(newBalance);
    });

    test('should reject negative balance', async () => {
      await request(app)
        .put('/api/users/1/balance')
        .send({ balance: -10 })
        .expect(400);
    });

    test('should reject invalid balance type', async () => {
      await request(app)
        .put('/api/users/1/balance')
        .send({ balance: 'invalid' })
        .expect(400);
    });
  });
});
