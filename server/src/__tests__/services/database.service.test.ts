import { db } from '../../services/database.service';
import type { User, Contact, CallHistoryRecord } from '../../types';
import { v4 as uuidv4 } from 'uuid';

describe('DatabaseService', () => {
  beforeEach(() => {
    // Reset database state before each test
    // Note: In production, you'd use a test database
  });

  describe('User Operations', () => {
    test('should create a new user', async () => {
      const newUser: User = {
        id: uuidv4(),
        name: 'John Smith',
        phone: `+1555${Date.now().toString().slice(-7)}`,
        email: `john${Date.now()}@example.com`,
        balance: 25.0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isVerified: true,
        password: 'password123'
      };

      const created = await db.createUser(newUser);

      expect(created).toEqual(expect.objectContaining({
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        balance: newUser.balance,
      }));
      expect(await db.getUser(newUser.id)).toBeDefined();
    });

    test('should get existing user', async () => {
      const user = await db.getUser('1');

      expect(user).toBeDefined();
      expect(user?.name).toBe('James Doe');
      expect(user?.phone).toBe('+19191234567');
    });

    test('should return null for non-existent user', async () => {
      const user = await db.getUser('non-existent-id');
      expect(user).toBeNull();
    });

    test('should update user information', async () => {
      const userId = '1';
      const updates = {
        name: 'James Updated',
        email: 'updated@example.com',
      };

      const updated = await db.updateUser(userId, updates);

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('James Updated');
      expect(updated?.email).toBe('updated@example.com');
    });

    test('should update user balance', async () => {
      const userId = '1';
      const newBalance = 100.0;

      const updated = await db.updateUserBalance(userId, newBalance);

      expect(updated).toBeDefined();
      expect(updated?.balance).toBe(newBalance);
    });

    test('should return null when updating non-existent user', async () => {
      const updated = await db.updateUser('non-existent', { name: 'Test' });
      expect(updated).toBeNull();
    });
  });

  describe('Contact Operations', () => {
    const testUserId = '1';

    test('should create a new contact', async () => {
      const newContact: Contact = {
        id: uuidv4(),
        name: 'Test Contact',
        phone: `+254798${Date.now().toString().slice(-6)}`,
        email: `test${Date.now()}@example.com`,
        location: 'Nairobi, Kenya',
        favorite: false,
        avatarColor: '#8B5CF6',
        createdAt: new Date(),
      };

      const created = await db.createContact(testUserId, newContact);

      expect(created).toEqual(expect.objectContaining({
        name: newContact.name,
        phone: newContact.phone,
        favorite: newContact.favorite,
      }));
      expect(await db.getContact(testUserId, newContact.id)).toBeDefined();
    });

    test('should get all contacts for user', async () => {
      const contacts = await db.getContacts(testUserId);

      expect(Array.isArray(contacts)).toBe(true);
      expect(contacts.length).toBeGreaterThan(0);
    });

    test('should sort contacts with favorites first', async () => {
      const contacts = await db.getContacts(testUserId);
      const favoriteIndices = contacts
        .map((c, i) => (c.favorite ? i : -1))
        .filter(i => i !== -1);

      // All favorites should come before non-favorites
      if (favoriteIndices.length > 0) {
        const lastFavoriteIndex = Math.max(...favoriteIndices);
        const firstNonFavoriteIndex = contacts.findIndex(c => !c.favorite);

        if (firstNonFavoriteIndex !== -1) {
          expect(lastFavoriteIndex).toBeLessThan(firstNonFavoriteIndex);
        }
      }
    });

    test('should get contact by ID', async () => {
      const contacts = await db.getContacts(testUserId);
      const firstContact = contacts[0];

      const found = await db.getContact(testUserId, firstContact.id);

      expect(found).toEqual(firstContact);
    });

    test('should get contact by phone number', async () => {
      const targetPhone = '+254712345678';
      const found = await db.getContactByPhone(testUserId, targetPhone);

      expect(found).toBeDefined();
      expect(found?.phone).toBe(targetPhone);
    });

    test('should update contact', async () => {
      const contacts = await db.getContacts(testUserId);
      const contactToUpdate = contacts[0];

      const updates = {
        name: 'Updated Name',
        favorite: !contactToUpdate.favorite,
      };

      const updated = await db.updateContact(testUserId, contactToUpdate.id, updates);

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.favorite).toBe(!contactToUpdate.favorite);
    });

    test('should delete contact', async () => {
      const newContact: Contact = {
        id: uuidv4(),
        name: 'To Delete',
        phone: `+254799${Date.now().toString().slice(-6)}`,
        favorite: false,
        avatarColor: '#EF4444',
        createdAt: new Date(),
      };

      await db.createContact(testUserId, newContact);

      const deleted = await db.deleteContact(testUserId, newContact.id);

      expect(deleted).toBe(true);
      expect(await db.getContact(testUserId, newContact.id)).toBeNull();
    });

    test('should return false when deleting non-existent contact', async () => {
      const deleted = await db.deleteContact(testUserId, 'non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('Call History Operations', () => {
    const testUserId = '1';
    const testUserPhone = '+19191234567';

    test('should create call record', async () => {
      const callRecord: CallHistoryRecord = {
        id: uuidv4(),
        callSid: `CA${Date.now()}`,
        from: testUserPhone,
        to: '+254712345678',
        direction: 'outgoing',
        status: 'completed',
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(Date.now() + 120000),
        duration: 120,
        cost: 0.10,
        ratePerMinute: 0.05,
      };

      const created = await db.createCallRecord(callRecord);

      expect(created).toEqual(expect.objectContaining({
        callSid: callRecord.callSid,
        from: callRecord.from,
        to: callRecord.to,
      }));
    });

    test('should get call history for user', async () => {
      const history = await db.getCallHistory(testUserId);

      expect(Array.isArray(history)).toBe(true);
    });

    test('should limit call history results', async () => {
      const limit = 10;
      const history = await db.getCallHistory(testUserId, limit);

      expect(history.length).toBeLessThanOrEqual(limit);
    });

    test('should sort call history by date descending', async () => {
      const history = await db.getCallHistory(testUserId);

      if (history.length > 1) {
        for (let i = 1; i < history.length; i++) {
          expect(history[i - 1].date.getTime()).toBeGreaterThanOrEqual(
            history[i].date.getTime()
          );
        }
      }
    });

    test('should get call history for specific contact', async () => {
      const contactPhone = '+254712345678';
      const history = await db.getCallHistoryForContact(testUserId, contactPhone);

      expect(Array.isArray(history)).toBe(true);
      history.forEach(call => {
        expect(
          call.from === contactPhone || call.to === contactPhone
        ).toBe(true);
      });
    });
  });
});