import { APIService } from '@/services/api.services';
import { ContactStorage, CallLogStorage } from '@/services/storage.services';
import { createMockContact, createMockCallLog } from '../setup';

// Mock storage
jest.mock('@/services/storage.service');

describe('APIService', () => {
  beforeEach(async () => {
    jest.clearAllMocks();

    // Reset the API service internal state completely
    (APIService as any).contacts = [];
    (APIService as any).callLogs = [];
    (APIService as any).isInitialized = false;

    // Mock storage initialization
    (ContactStorage.load as jest.Mock).mockResolvedValue([]);
    (CallLogStorage.load as jest.Mock).mockResolvedValue([]);

    await APIService.initialize();
  });

  describe('Contacts', () => {
    test('should get all contacts', () => {
      const contacts = APIService.getContacts();

      expect(Array.isArray(contacts)).toBe(true);
    });

    test('should get contact by ID', async () => {
      const contact = createMockContact();
      await APIService.addContact(contact);

      const found = APIService.getContactById(contact.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(contact.id);
    });

    test('should get contact by phone', async () => {
      const contact = createMockContact({ phone: '+254712345678' });
      await APIService.addContact(contact);

      const found = APIService.getContactByPhone('+254712345678');

      expect(found).toBeDefined();
      expect(found?.phone).toBe('+254712345678');
    });

    test('should add new contact', async () => {
      const contact = createMockContact();

      await APIService.addContact(contact);

      const found = APIService.getContactById(contact.id);
      expect(found).toBeDefined();
      expect(ContactStorage.save).toHaveBeenCalled();
    });

    test('should update existing contact', async () => {
      const contact = createMockContact();
      await APIService.addContact(contact);

      const updates = { name: 'Updated Name', favorite: true };
      const updated = await APIService.updateContact(contact.id, updates);

      expect(updated?.name).toBe('Updated Name');
      expect(updated?.favorite).toBe(true);
      expect(ContactStorage.save).toHaveBeenCalled();
    });

    test('should return null when updating non-existent contact', async () => {
      const updated = await APIService.updateContact('non-existent', { name: 'Test' });

      expect(updated).toBeNull();
    });

    test('should delete contact', async () => {
      const contact = createMockContact({ id: 'unique-delete-id' });
      await APIService.addContact(contact);

      // Verify it was added
      expect(APIService.getContactById(contact.id)).toBeDefined();

      const deleted = await APIService.deleteContact(contact.id);

      expect(deleted).toBe(true);
      expect(APIService.getContactById(contact.id)).toBeUndefined();
      expect(ContactStorage.save).toHaveBeenCalled();
    });

    test('should return false when deleting non-existent contact', async () => {
      const deleted = await APIService.deleteContact('non-existent');

      expect(deleted).toBe(false);
    });

    test('should clear all contacts', async () => {
      await APIService.addContact(createMockContact());
      await APIService.addContact(createMockContact({ id: '2' }));

      await APIService.clearContacts();

      expect(APIService.getContacts()).toHaveLength(0);
      expect(ContactStorage.clear).toHaveBeenCalled();
    });
  });

  describe('Call Logs', () => {
    test('should save call log', async () => {
      const callLog = createMockCallLog();

      await APIService.saveCallLog(callLog);

      expect(CallLogStorage.append).toHaveBeenCalledWith(callLog);
    });

    test('should not save duplicate call logs', async () => {
      const callLog = createMockCallLog({
        call: {
          callSid: 'CA-unique-test',
          from: '+19191234567',
          to: '+254712345678',
          state: 'connected' as const,
          direction: 'outgoing' as const,
          isMuted: false,
          isOnHold: false,
        }
      });

      await APIService.saveCallLog(callLog);

      // Clear mocks after first save
      jest.clearAllMocks();

      await APIService.saveCallLog(callLog); // Try to save again

      // Should not be called again
      expect(CallLogStorage.append).toHaveBeenCalledTimes(0);
    });

    test('should get all call logs', async () => {
      const callLog = createMockCallLog();
      await APIService.saveCallLog(callLog);

      const logs = APIService.getCallLogs();

      expect(Array.isArray(logs)).toBe(true);
    });

    test('should sort call logs by date descending', async () => {
      // Create calls with different times and unique IDs
      const oldCall = createMockCallLog({
        callStartTime: new Date('2024-01-01'),
        call: {
          callSid: 'CA-old-call',
          from: '+19191234567',
          to: '+254712345678',
          state: 'connected' as const,
          direction: 'outgoing' as const,
          isMuted: false,
          isOnHold: false,
        },
      });
      const newCall = createMockCallLog({
        callStartTime: new Date('2024-01-02'),
        call: {
          callSid: 'CA-new-call',
          from: '+19191234567',
          to: '+254712345678',
          state: 'connected' as const,
          direction: 'outgoing' as const,
          isMuted: false,
          isOnHold: false,
        },
      });

      await APIService.saveCallLog(oldCall);
      await APIService.saveCallLog(newCall);

      const logs = APIService.getCallLogs();

      expect(logs[0].call?.callSid).toBe('CA-new-call'); // Newer first
    });

    test('should enrich call log with contact info', async () => {
      const contact = createMockContact({ phone: '+254712345678' });
      await APIService.addContact(contact);

      const callLog = createMockCallLog({
        call: {
          callSid: 'CA-enrich-test',
          from: '+19191234567',
          to: '+254712345678',
          state: 'connected' as const,
          direction: 'outgoing' as const,
          isMuted: false,
          isOnHold: false,
        },
      });

      const enriched = APIService.enrichCallLog(callLog);

      expect(enriched.contactName).toBe(contact.name);
      expect(enriched.contactId).toBe(contact.id);
      expect(enriched.contactAvatar).toBe(contact.avatarColor);
    });

    test('should get call logs for contact', async () => {
      const contact = createMockContact({ phone: '+254712345678' });
      await APIService.addContact(contact);

      const callLog1 = createMockCallLog({
        call: {
          callSid: 'CA-for-contact',
          from: '+19191234567',
          to: '+254712345678',
          state: 'connected' as const,
          direction: 'outgoing' as const,
          isMuted: false,
          isOnHold: false,
        },
      });

      await APIService.saveCallLog(callLog1);

      const logs = APIService.getCallLogsForContact('+254712345678');

      expect(logs).toHaveLength(1);
      expect(logs[0].call?.to).toBe('+254712345678');
    });

    test('should clear call logs', async () => {
      await APIService.saveCallLog(createMockCallLog());

      await APIService.clearCallLogs();

      expect(APIService.getCallLogs()).toHaveLength(0);
      expect(CallLogStorage.clear).toHaveBeenCalled();
    });
  });
});