import type { Contact, User, CallUIData, EnrichedCallLog } from '@/types';
import {
  ContactStorage,
  CallLogStorage,
  UserStorage,
  StorageService,
} from './storage.service';

// Backend API URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// In-memory cache (for performance and offline support)
let contacts: Contact[] = [];
let callLogs: CallUIData[] = [];
let currentUserId: string | null = null;
let users: User[] = [];

let isInitialized = false;

// Default data (used only as fallback)
const DEFAULT_USERS: User[] = [
  {
    id: '1',
    name: 'James Doe',
    phone: '+1 (919) 123-4567',
    balance: 22.5,
    email: 'john.doe@example.com',
  },
];

// ============================================
// API CLIENT
// ============================================

class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data as T;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Contacts
  async getContacts(userId: string): Promise<Contact[]> {
    return this.request<Contact[]>(`/contacts?userId=${userId}`);
  }

  async createContact(userId: string, contact: Contact): Promise<Contact> {
    return this.request<Contact>(`/contacts?userId=${userId}`, {
      method: 'POST',
      body: JSON.stringify(contact),
    });
  }

  async updateContact(userId: string, contactId: string, updates: Partial<Contact>): Promise<Contact> {
    return this.request<Contact>(`/contacts/${contactId}?userId=${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteContact(userId: string, contactId: string): Promise<void> {
    return this.request<void>(`/contacts/${contactId}?userId=${userId}`, {
      method: 'DELETE',
    });
  }

  // User
  async getUser(userId: string): Promise<User> {
    return this.request<User>(`/users/${userId}`);
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Token
  async getAccessToken(userId: string): Promise<{ token: string; identity: string; expiresAt: Date }> {
    return this.request<any>(`/token?userId=${userId}`);
  }
}

const apiClient = new APIClient(API_BASE_URL);

// ============================================
// INITIALIZATION
// ============================================

async function initialize(): Promise<void> {
  if (isInitialized) {
    console.log('ℹ️ API Service already initialized');
    return;
  }

  console.log('🚀 Initializing API Service...');

  try {
    // Load data from local storage first
    const stored = await StorageService.initialize();
    callLogs = stored.callLogs;

    // Try to fetch from backend
    try {
      const userId = '1'; // TODO: Get from auth
      currentUserId = userId;

      // Fetch user from backend
      const user = await apiClient.getUser(userId);
      users = [user];
      await UserStorage.saveProfile(user);

      // Fetch contacts from backend
      const backendContacts = await apiClient.getContacts(userId);
      contacts = backendContacts;
      await ContactStorage.save(contacts);

      console.log('✅ Synced data from backend');
    } catch (error) {
      console.warn('⚠️ Could not sync with backend, using local data', error);

      // Use local data
      if (stored.contacts.length === 0) {
        console.log('📦 No local data, using defaults');
        contacts = [];
      } else {
        contacts = stored.contacts;
      }

      if (!stored.user) {
        const defaultUser = DEFAULT_USERS[0];
        users = DEFAULT_USERS;
        currentUserId = defaultUser.id;
        await UserStorage.saveProfile(defaultUser);
      } else {
        users = [stored.user];
        currentUserId = stored.user.id;
      }
    }

    isInitialized = true;
    console.log('✅ API Service initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize API Service:', error);
    contacts = [];
    users = [...DEFAULT_USERS];
    currentUserId = DEFAULT_USERS[0].id;
    isInitialized = true;
  }
}

// ============================================
// EXPORTS (same interface as before)
// ============================================

export const APIService = {
  initialize,

  // Contacts - now syncs with backend
  getContacts: (): Contact[] => {
    return [...contacts];
  },

  getContactById: (id: string): Contact | undefined => {
    return contacts.find((c) => c.id === id);
  },

  getContactByPhone: (phone: string): Contact | undefined => {
    return contacts.find((c) => c.phone === phone);
  },

  addContact: async (contact: Contact): Promise<void> => {
    try {
      const userId = currentUserId || '1';
      await apiClient.createContact(userId, contact);
      contacts.push(contact);
      await ContactStorage.save(contacts);
      console.log('✅ Contact added and synced:', contact.name);
    } catch (error) {
      console.warn('Failed to sync contact with backend:', error);

      // Fallback to local only
      contacts.push(contact);
      await ContactStorage.save(contacts);
      console.log('✅ Contact added locally (offline):', contact.name);
    }
  },

  updateContact: async (
    id: string,
    updates: Partial<Contact>
  ): Promise<Contact | null> => {
    const index = contacts.findIndex((c) => c.id === id);
    if (index === -1) return null;

    try {
      const userId = currentUserId || '1';
      const updated = await apiClient.updateContact(userId, id, updates);
      contacts[index] = updated;
      await ContactStorage.save(contacts);
      console.log('✅ Contact updated and synced:', updated.name);
      return updated;
    } catch (error) {
      console.warn('Failed to sync contact update with backend:', error);
      // Fallback to local only
      contacts[index] = { ...contacts[index], ...updates };
      await ContactStorage.save(contacts);
      console.log('✅ Contact updated locally (offline)');
      return contacts[index];
    }
  },

  deleteContact: async (id: string): Promise<boolean> => {
    const index = contacts.findIndex((c) => c.id === id);
    if (index === -1) return false;

    try {
      const userId = currentUserId || '1';
      await apiClient.deleteContact(userId, id);
      contacts.splice(index, 1);
      await ContactStorage.save(contacts);
      console.log('✅ Contact deleted and synced');
      return true;
    } catch (error) {
      console.warn('Failed to sync contact deletion with backend:', error);
      // Fallback to local only
      contacts.splice(index, 1);
      await ContactStorage.save(contacts);
      console.log('✅ Contact deleted locally (offline)');
      return true;
    }
  },

  clearContacts: async (): Promise<void> => {
    contacts = [];
    await ContactStorage.clear();
  },

  // Call logs (same as before - local only for now)
  enrichCallLog: (callLog: CallUIData): EnrichedCallLog => {
    if (!callLog.call) return callLog;

    const phoneToLookup =
      callLog.call.direction === 'outgoing'
        ? callLog.call.to
        : callLog.call.from;

    const contact = APIService.getContactByPhone(phoneToLookup);

    return {
      ...callLog,
      contactName: contact?.name,
      contactId: contact?.id,
      contactAvatar: contact?.avatarColor,
    };
  },

  getCallLogs: (): EnrichedCallLog[] => {
    if (!isInitialized) {
      return [];
    }

    return [...callLogs]
      .sort((a, b) => {
        const aTime = a.callStartTime?.getTime() ?? 0;
        const bTime = b.callStartTime?.getTime() ?? 0;
        return bTime - aTime;
      })
      .map((log) => APIService.enrichCallLog(log));
  },

  saveCallLog: async (call: CallUIData): Promise<void> => {
    if (!call.call || !call.callStartTime) {
      return;
    }

    const isDuplicate = callLogs.some(
      (log) => log.call?.callSid === call.call?.callSid
    );

    if (isDuplicate) {
      return;
    }

    callLogs.push(call);
    await CallLogStorage.append(call);
  },

  getCallLogsForContact: (contactPhone: string): EnrichedCallLog[] => {
    return callLogs
      .filter(
        (log) =>
          log.call?.to === contactPhone || log.call?.from === contactPhone
      )
      .sort((a, b) => {
        const aTime = a.callStartTime?.getTime() ?? 0;
        const bTime = b.callStartTime?.getTime() ?? 0;
        return bTime - aTime;
      })
      .map((log) => APIService.enrichCallLog(log));
  },

  clearCallLogs: async (): Promise<void> => {
    callLogs = [];
    await CallLogStorage.clear();
  },

  // Get access token from backend
  getAccessToken: async (userId: string): Promise<string> => {
    try {
      const response = await apiClient.getAccessToken(userId);
      return response.token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return `mock-token-${Date.now()}`;
    }
  },
};

export const mockDatabase = {
  getCurrentUser: (): User | null => {
    if (!isInitialized || !currentUserId) return null;
    return users.find((u) => u.id === currentUserId) || null;
  },

  setCurrentUser: async (id: string): Promise<void> => {
    if (users.some((u) => u.id === id)) {
      currentUserId = id;
      await UserStorage.setCurrentUserId(id);
    }
  },

  updateUserBalance: async (id: string, newBalance: number): Promise<void> => {
    const user = users.find((u) => u.id === id);
    if (user) {
      user.balance = newBalance;
      await UserStorage.updateBalance(id, newBalance);
    }
  },

  updateUserProfile: async (id: string, updates: Partial<User>): Promise<void> => {
    const user = users.find((u) => u.id === id);
    if (user) {
      Object.assign(user, updates);
      await UserStorage.saveProfile(user);
    }
  },
};
