import { db } from '../../services/database.service';
import type { User, Contact, CallHistoryRecord } from '../../types';
import { v4 as uuidv4 } from 'uuid';

describe('DatabaseService', () => {
  beforeEach(() => {
    // Reset database state before each test
    // Note: In production, you'd use a test database
  });

  describe('User Operations', () => {
    test('should create a new user', () => {
      const newUser: User = {
        id: uuidv4(),
        name: 'John Smith',
        phone: '+15551234567',
        email: 'john@example.com',
        balance: 25.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const created = db.createUser(newUser);

      expect(created).toEqual(newUser);
      expect(db.getUser(newUser.id)).toEqual(newUser);
    });

    test('should get existing user', () => {
      const user = db.getUser('1');

      expect(user).toBeDefined();
      expect(user?.name).toBe('James Doe');
      expect(user?.phone).toBe('+19191234567');
    });

    test('should return undefined for non-existent user', () => {
      const user = db.getUser('non-existent-id');
      expect(user).toBeUndefined();
    });

    test('should update user information', () => {
      const userId = '1';
      const updates = {
        name: 'James Updated',
        email: 'updated@example.com',
      };

      const updated = db.updateUser(userId, updates);

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('James Updated');
      expect(updated?.email).toBe('updated@example.com');
    });

    test('should update user balance', () => {
      const userId = '1';
      const newBalance = 100.0;

      const updated = db.updateUserBalance(userId, newBalance);

      expect(updated).toBeDefined();
      expect(updated?.balance).toBe(newBalance);
    });

    test('should return undefined when updating non-existent user', () => {
      const updated = db.updateUser('non-existent', { name: 'Test' });
      expect(updated).toBeUndefined();
    });
  });

  describe('Contact Operations', () => {
    const testUserId = '1';

    test('should create a new contact', () => {
      const newContact: Contact = {
        id: uuidv4(),
        name: 'Test Contact',
        phone: '+254798765432',
        email: 'test@example.com',
        location: 'Nairobi, Kenya',
        favorite: false,
        avatarColor: '#8B5CF6',
        createdAt: new Date(),
      };

      const created = db.createContact(testUserId, newContact);

      expect(created).toEqual(newContact);
      expect(db.getContact(testUserId, newContact.id)).toEqual(newContact);
    });

    test('should get all contacts for user', () => {
      const contacts = db.getContacts(testUserId);

      expect(Array.isArray(contacts)).toBe(true);
      expect(contacts.length).toBeGreaterThan(0);
    });

    test('should sort contacts with favorites first', () => {
      const contacts = db.getContacts(testUserId);
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

    test('should get contact by ID', () => {
      const contacts = db.getContacts(testUserId);
      const firstContact = contacts[0];

      const found = db.getContact(testUserId, firstContact.id);

      expect(found).toEqual(firstContact);
    });

    test('should get contact by phone number', () => {
      const targetPhone = '+254712345678';
      const found = db.getContactByPhone(testUserId, targetPhone);

      expect(found).toBeDefined();
      expect(found?.phone).toBe(targetPhone);
    });

    test('should update contact', () => {
      const contacts = db.getContacts(testUserId);
      const contactToUpdate = contacts[0];

      const updates = {
        name: 'Updated Name',
        favorite: !contactToUpdate.favorite,
      };

      const updated = db.updateContact(testUserId, contactToUpdate.id, updates);

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.favorite).toBe(!contactToUpdate.favorite);
    });

    test('should delete contact', () => {
      const newContact: Contact = {
        id: uuidv4(),
        name: 'To Delete',
        phone: '+254799999999',
        favorite: false,
        avatarColor: '#EF4444',
        createdAt: new Date(),
      };

      db.createContact(testUserId, newContact);

      const deleted = db.deleteContact(testUserId, newContact.id);

      expect(deleted).toBe(true);
      expect(db.getContact(testUserId, newContact.id)).toBeUndefined();
    });

    test('should return false when deleting non-existent contact', () => {
      const deleted = db.deleteContact(testUserId, 'non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('Call History Operations', () => {
    const testUserId = '1';
    const testUserPhone = '+19191234567';

    test('should create call record', () => {
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

      const created = db.createCallRecord(callRecord);

      expect(created).toEqual(callRecord);
    });

    test('should get call history for user', () => {
      const history = db.getCallHistory(testUserId);

      expect(Array.isArray(history)).toBe(true);
    });

    test('should limit call history results', () => {
      const limit = 10;
      const history = db.getCallHistory(testUserId, limit);

      expect(history.length).toBeLessThanOrEqual(limit);
    });

    test('should sort call history by date descending', () => {
      const history = db.getCallHistory(testUserId);

      if (history.length > 1) {
        for (let i = 1; i < history.length; i++) {
          expect(history[i - 1].date.getTime()).toBeGreaterThanOrEqual(
            history[i].date.getTime()
          );
        }
      }
    });

    test('should get call history for specific contact', () => {
      const contactPhone = '+254712345678';
      const history = db.getCallHistoryForContact(testUserId, contactPhone);

      expect(Array.isArray(history)).toBe(true);
      history.forEach(call => {
        expect(
          call.from === contactPhone || call.to === contactPhone
        ).toBe(true);
      });
    });
  });
});
