import request from 'supertest';
import app from '../../app';
import { v4 as uuidv4 } from 'uuid';

describe('Contact Routes', () => {
  const testUserId = '1';

  describe('GET /api/contacts', () => {
    test('should get all contacts for user', async () => {
      const response = await request(app)
        .get('/api/contacts')
        .query({ userId: testUserId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should return contacts sorted with favorites first', async () => {
      const response = await request(app)
        .get('/api/contacts')
        .query({ userId: testUserId })
        .expect(200);

      const contacts = response.body.data;
      const firstFavoriteIndex = contacts.findIndex((c: any) => c.favorite);
      const lastFavoriteIndex = contacts.map((c: any, i: number) => c.favorite ? i : -1)
        .filter((i: number) => i !== -1)
        .pop();

      if (firstFavoriteIndex !== -1 && lastFavoriteIndex !== undefined) {
        const firstNonFavoriteIndex = contacts.findIndex((c: any) => !c.favorite);
        if (firstNonFavoriteIndex !== -1) {
          expect(lastFavoriteIndex).toBeLessThan(firstNonFavoriteIndex);
        }
      }
    });
  });

  describe('POST /api/contacts', () => {
    test('should create new contact', async () => {
      const newContact = {
        id: uuidv4(),
        name: 'Test New Contact',
        phone: '+254799999999',
        email: 'new@example.com',
        location: 'Nairobi, Kenya',
        favorite: false,
        avatarColor: '#3B82F6',
      };

      const response = await request(app)
        .post('/api/contacts')
        .query({ userId: testUserId })
        .send(newContact)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject(newContact);
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('updatedAt');

      // Store contactId if needed later
      const createdContactId = response.body.data.id;
      expect(createdContactId).toBeDefined();
    });

  describe('GET /api/contacts/:contactId', () => {
    test('should get specific contact', async () => {
      // First, get all contacts to get a valid ID
      const listResponse = await request(app)
        .get('/api/contacts')
        .query({ userId: testUserId });

      const contactId = listResponse.body.data[0].id;

      const response = await request(app)
        .get(`/api/contacts/${contactId}`)
        .query({ userId: testUserId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(contactId);
    });

    test('should return 404 for non-existent contact', async () => {
      await request(app)
        .get('/api/contacts/non-existent-id')
        .query({ userId: testUserId })
        .expect(404);
    });
  });

  describe('PUT /api/contacts/:contactId', () => {
    test('should update contact', async () => {
      const listResponse = await request(app)
        .get('/api/contacts')
        .query({ userId: testUserId });

      const contactId = listResponse.body.data[0].id;

      const updates = {
        name: 'Updated Contact Name',
        favorite: true,
        email: 'updated@example.com',
      };

      const response = await request(app)
        .put(`/api/contacts/${contactId}`)
        .query({ userId: testUserId })
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updates.name);
      expect(response.body.data.favorite).toBe(updates.favorite);
      expect(response.body.data.email).toBe(updates.email);
      expect(response.body.data).toHaveProperty('updatedAt');
    });

    test('should return 404 when updating non-existent contact', async () => {
      await request(app)
        .put('/api/contacts/non-existent')
        .query({ userId: testUserId })
        .send({ name: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE /api/contacts/:contactId', () => {
    test('should delete contact', async () => {
      // Create a contact to delete
      const contactToDelete = {
        id: uuidv4(),
        name: 'To Be Deleted',
        phone: '+254777777777',
        favorite: false,
        avatarColor: '#8B5CF6',
      };

      const createResponse = await request(app)
        .post('/api/contacts')
        .query({ userId: testUserId })
        .send(contactToDelete);

      const contactId = createResponse.body.data.id;

      // Delete the contact
      const response = await request(app)
        .delete(`/api/contacts/${contactId}`)
        .query({ userId: testUserId })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify it's deleted
      await request(app)
        .get(`/api/contacts/${contactId}`)
        .query({ userId: testUserId })
        .expect(404);
    });

    test('should return 404 when deleting non-existent contact', async () => {
      await request(app)
        .delete('/api/contacts/non-existent')
        .query({ userId: testUserId })
        .expect(404);
    });
  });
});
})