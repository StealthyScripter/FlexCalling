import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
  ContactStorage,
  CallLogStorage,
  UserStorage,
  AuthStorage,
  StorageService,
} from '@/services/storage.service';
import { createMockContact, createMockCallLog, createMockUser } from '../setup';
import type { CallUIData } from '@/types';

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ContactStorage', () => {
    test('should save contacts', async () => {
      const contacts = [createMockContact(), createMockContact({ id: '2' })];

      await ContactStorage.save(contacts);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@flexcalling:contacts',
        JSON.stringify(contacts)
      );
    });

    test('should load contacts', async () => {
      const mockContacts = [createMockContact()];
      const serialized = JSON.stringify(mockContacts);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(serialized);

      const contacts = await ContactStorage.load();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@flexcalling:contacts');
      expect(JSON.stringify(contacts)).toEqual(serialized);
    });

    test('should return empty array when no contacts', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const contacts = await ContactStorage.load();

      expect(contacts).toEqual([]);
    });

    test('should clear contacts', async () => {
      await ContactStorage.clear();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@flexcalling:contacts');
    });
  });

  describe('CallLogStorage', () => {
    test('should save call logs', async () => {
      const callLogs: CallUIData[] = [createMockCallLog()];

      await CallLogStorage.save(callLogs);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test('should serialize dates when saving', async () => {
      const callLog: CallUIData = createMockCallLog();

      await CallLogStorage.save([callLog]);

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const parsed = JSON.parse(savedData);

      expect(typeof parsed[0].callStartTime).toBe('string');
    });

    test('should load call logs', async () => {
      const mockCallLog = createMockCallLog();
      const serialized = {
        ...mockCallLog,
        callStartTime: mockCallLog.callStartTime.toISOString(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify([serialized])
      );

      const callLogs = await CallLogStorage.load();

      expect(callLogs).toHaveLength(1);
      expect(callLogs[0].callStartTime).toBeInstanceOf(Date);
    });

    test('should append call log', async () => {
      const existingLog: CallUIData = createMockCallLog({
        call: {
          callSid: 'CA111',
          from: '+19191234567',
          to: '+254712345678',
          state: 'connected' as const,
          direction: 'outgoing' as const,
          isMuted: false,
          isOnHold: false,
        },
      });
      const newLog: CallUIData = createMockCallLog({
        call: {
          callSid: 'CA222',
          from: '+19191234567',
          to: '+254712345678',
          state: 'connected' as const,
          direction: 'outgoing' as const,
          isMuted: false,
          isOnHold: false,
        },
      });

      const existingStartTime = existingLog.callStartTime || new Date();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify([{
          ...existingLog,
          callStartTime: existingStartTime.toISOString(),
        }])
      );

      await CallLogStorage.append(newLog);

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const parsed = JSON.parse(savedData);

      expect(parsed).toHaveLength(2);
      expect(parsed[0].call.callSid).toBe('CA222');
    });

    test('should get call logs for contact', async () => {
      const targetPhone = '+254712345678';
      const callLogs: CallUIData[] = [
        createMockCallLog({
          call: {
            callSid: 'CA111',
            from: '+19191234567',
            to: targetPhone,
            state: 'connected' as const,
            direction: 'outgoing' as const,
            isMuted: false,
            isOnHold: false,
          },
        }),
        createMockCallLog({
          call: {
            callSid: 'CA222',
            from: '+19191234567',
            to: '+254799999999',
            state: 'connected' as const,
            direction: 'outgoing' as const,
            isMuted: false,
            isOnHold: false,
          },
        }),
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(callLogs.map(log => ({
          ...log,
          callStartTime: (log.callStartTime || new Date()).toISOString(),
        })))
      );

      const filtered = await CallLogStorage.getForContact(targetPhone);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].call?.to).toBe(targetPhone);
    });
  });

  describe('UserStorage', () => {
    test('should save user profile', async () => {
      const user = createMockUser();

      await UserStorage.saveProfile(user);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@flexcalling:user_profile',
        JSON.stringify(user)
      );
    });

    test('should load user profile', async () => {
      const mockUser = createMockUser();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockUser)
      );

      const user = await UserStorage.loadProfile();

      expect(user).toEqual(mockUser);
    });

    test('should update user balance', async () => {
      const user = createMockUser({ balance: 25.0 });
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(user)
      );

      await UserStorage.updateBalance('1', 50.0);

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const updated = JSON.parse(savedData);

      expect(updated.balance).toBe(50.0);
    });

    test('should get current user ID', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('"1"');

      const userId = await UserStorage.getCurrentUserId();

      expect(userId).toBe('1');
    });

    test('should set current user ID', async () => {
      await UserStorage.setCurrentUserId('123');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@flexcalling:current_user_id',
        JSON.stringify('123')
      );
    });
  });

  describe('AuthStorage', () => {
    test('should set auth token securely', async () => {
      const token = 'test-auth-token';

      await AuthStorage.setAuthToken(token);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', token);
    });

    test('should get auth token', async () => {
      const token = 'test-auth-token';
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(token);

      const retrieved = await AuthStorage.getAuthToken();

      expect(retrieved).toBe(token);
    });

    test('should check if authenticated', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('token');

      const isAuth = await AuthStorage.isAuthenticated();

      expect(isAuth).toBe(true);
    });

    test('should return false when not authenticated', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

      const isAuth = await AuthStorage.isAuthenticated();

      expect(isAuth).toBe(false);
    });

    test('should clear auth data', async () => {
      await AuthStorage.clearAuth();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(3);
    });
  });

  describe('StorageService', () => {
    test('should initialize storage', async () => {
      const mockUser = createMockUser();
      const mockContacts = [createMockContact()];
      const mockCallLogs: CallUIData[] = [createMockCallLog()];

      const callLogStartTime = mockCallLogs[0].callStartTime || new Date();

      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(mockContacts))
        .mockResolvedValueOnce(JSON.stringify([{
          ...mockCallLogs[0],
          callStartTime: callLogStartTime.toISOString(),
        }]))
        .mockResolvedValueOnce(JSON.stringify(mockUser));

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('token');

      const data = await StorageService.initialize();

      expect(data.contacts).toHaveLength(1);
      expect(data.callLogs).toHaveLength(1);
      expect(data.user).toEqual(mockUser);
      expect(data.isAuthenticated).toBe(true);
    });

    test('should clear all data', async () => {
      await StorageService.clearAllData();

      expect(AsyncStorage.removeItem).toHaveBeenCalled();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(3);
    });

    test('should export data', async () => {
      const mockUser = createMockUser();
      const mockContacts = [createMockContact()];
      const mockCallLogs: CallUIData[] = [createMockCallLog()];

      const callLogStartTime = mockCallLogs[0].callStartTime || new Date();

      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(mockContacts))
        .mockResolvedValueOnce(JSON.stringify([{
          ...mockCallLogs[0],
          callStartTime: callLogStartTime.toISOString(),
        }]))
        .mockResolvedValueOnce(JSON.stringify(mockUser));

      const exported = await StorageService.exportData();

      expect(JSON.stringify(exported.contacts)).toEqual(JSON.stringify(mockContacts));
      expect(exported.callLogs).toHaveLength(1);
      expect(exported.user).toEqual(mockUser);
    });

    test('should import data', async () => {
      const data = {
        contacts: [createMockContact()],
        callLogs: [createMockCallLog()] as CallUIData[],
        user: createMockUser(),
      };

      await StorageService.importData(data);

      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(3);
    });
  });
});