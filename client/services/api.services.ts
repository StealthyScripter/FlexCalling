import type { Contact, User, CallUIData, EnrichedCallLog } from '@/types';
import {
  ContactStorage,
  CallLogStorage,
  UserStorage,
  StorageService,
} from './storage.services';
import { AuthService } from './auth.services';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

let contacts: Contact[] = [];
let callLogs: CallUIData[] = [];
let currentUser: User | null = null;
let isInitialized = false;

// ============================================
// AUTHENTICATED API CLIENT
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
      // Get auth token
      const token = await AuthService.getToken();

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        console.warn('⚠️ Authentication failed - clearing auth data');
        await AuthService.clearAuthData();
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data as T;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // ============================================
  // CONTACTS - Authenticated endpoints
  // ============================================

  async getContacts(): Promise<Contact[]> {
    return this.request<Contact[]>('/contacts');
  }

  async getContactById(contactId: string): Promise<Contact> {
    return this.request<Contact>(`/contacts/${contactId}`);
  }

  async createContact(contact: Omit<Contact, 'createdAt' | 'updatedAt'>): Promise<Contact> {
    return this.request<Contact>('/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
    });
  }

  async updateContact(contactId: string, updates: Partial<Contact>): Promise<Contact> {
    return this.request<Contact>(`/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteContact(contactId: string): Promise<void> {
    return this.request<void>(`/contacts/${contactId}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // USER - Authenticated endpoints
  // ============================================

  async getUser(userId: string): Promise<User> {
    return this.request<User>(`/users/${userId}`);
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async updateUserBalance(userId: string, balance: number): Promise<User> {
    return this.request<User>(`/users/${userId}/balance`, {
      method: 'PUT',
      body: JSON.stringify({ balance }),
    });
  }

  // ============================================
  // CALLS - Authenticated endpoints
  // ============================================

  async makeCall(to: string, from: string) {
    return this.request('/calls', {
      method: 'POST',
      body: JSON.stringify({ to, from }),
    });
  }

  async getCallHistory(limit?: number): Promise<any[]> {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<any[]>(`/calls/history${query}`);
  }

  async getCallHistoryForContact(phone: string): Promise<any[]> {
    return this.request<any[]>(`/calls/history/contact/${phone}`);
  }

  async saveCallHistory(callData: any): Promise<any> {
    return this.request('/calls/history', {
      method: 'POST',
      body: JSON.stringify(callData),
    });
  }

  async getCallPricing(phoneNumber: string): Promise<{ ratePerMinute: number; currency: string }> {
    return this.request(`/calls/pricing/${phoneNumber}`);
  }

  // ============================================
  // TOKEN - Public endpoint
  // ============================================

  async getAccessToken(): Promise<{ token: string; identity: string; expiresAt: Date }> {
    const userId = await AuthService.getUserId();
    const query = userId ? `?userId=${userId}` : '';
    return this.request<any>(`/token${query}`);
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

    // Check if user is authenticated
    const isAuthenticated = await AuthService.isAuthenticated();

    if (isAuthenticated) {
      try {
        // Get user ID from secure storage
        const userId = await AuthService.getUserId();

        if (userId) {
          // Fetch user profile from backend
          const user = await apiClient.getUser(userId);
          currentUser = user;
          await UserStorage.saveProfile(user);

          // Fetch contacts from backend
          const backendContacts = await apiClient.getContacts();
          contacts = backendContacts;
          await ContactStorage.save(contacts);

          console.log('✅ Synced data from backend');
        }
      } catch (error) {
        console.warn('⚠️ Could not sync with backend, using local data', error);

        // Use local data
        if (stored.contacts.length > 0) {
          contacts = stored.contacts;
        }

        if (stored.user) {
          currentUser = stored.user;
        }
      }
    } else {
      console.log('ℹ️ User not authenticated, using local data only');
      contacts = stored.contacts;
      currentUser = stored.user;
    }

    isInitialized = true;
    console.log('✅ API Service initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize API Service:', error);
    contacts = [];
    currentUser = null;
    isInitialized = true;
  }
}

// ============================================
// EXPORTS - Works with authentication
// ============================================

export const APIService = {
  initialize,

  // ============================================
  // CONTACTS
  // ============================================

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
      const created = await apiClient.createContact(contact);
      contacts.push(created);
      await ContactStorage.save(contacts);
      console.log('✅ Contact added and synced:', created.name);
    } catch (error) {
      console.warn('Failed to sync contact with backend:', error);
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
      const updated = await apiClient.updateContact(id, updates);
      contacts[index] = updated;
      await ContactStorage.save(contacts);
      console.log('✅ Contact updated and synced:', updated.name);
      return updated;
    } catch (error) {
      console.warn('Failed to sync contact update with backend:', error);
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
      await apiClient.deleteContact(id);
      contacts.splice(index, 1);
      await ContactStorage.save(contacts);
      console.log('✅ Contact deleted and synced');
      return true;
    } catch (error) {
      console.warn('Failed to sync contact deletion with backend:', error);
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

  // ============================================
  // CALL LOGS
  // ============================================

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

    // Try to sync with backend
    try {
      await apiClient.saveCallHistory({
        callSid: call.call.callSid,
        from: call.call.from,
        to: call.call.to,
        direction: call.call.direction,
        status: 'completed',
        date: call.callStartTime.toISOString(),
        startTime: call.callStartTime.toISOString(),
        endTime: new Date(call.callStartTime.getTime() + call.callDuration * 1000).toISOString(),
        duration: call.callDuration,
        cost: call.estimatedCost,
        ratePerMinute: call.ratePerMinute,
      });
      console.log('✅ Call log synced with backend');
    } catch (error) {
      console.warn('⚠️ Failed to sync call log with backend:', error);
    }
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

  // ============================================
  // ACCESS TOKEN
  // ============================================

  getAccessToken: async (): Promise<string> => {
    try {
      const response = await apiClient.getAccessToken();
      return response.token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return `mock-token-${Date.now()}`;
    }
  },

  // ============================================
  // SYNC
  // ============================================

  syncWithBackend: async (): Promise<void> => {
    const isAuthenticated = await AuthService.isAuthenticated();
    if (!isAuthenticated) {
      console.log('ℹ️ Not authenticated, skipping sync');
      return;
    }

    try {
      console.log('🔄 Syncing with backend...');

      // Sync contacts
      const backendContacts = await apiClient.getContacts();
      contacts = backendContacts;
      await ContactStorage.save(contacts);

      // Sync user data
      const userId = await AuthService.getUserId();
      if (userId) {
        const user = await apiClient.getUser(userId);
        currentUser = user;
        await UserStorage.saveProfile(user);
      }

      console.log('✅ Sync completed successfully');
    } catch (error) {
      console.error('❌ Sync failed:', error);
      throw error;
    }
  },
};

export const mockDatabase = {
  getCurrentUser: (): User | null => {
    return currentUser;
  },

  setCurrentUser: async (user: User): Promise<void> => {
    currentUser = user;
    await UserStorage.saveProfile(user);
  },

  updateUserBalance: async (newBalance: number): Promise<void> => {
    if (currentUser) {
      currentUser.balance = newBalance;
      await UserStorage.saveProfile(currentUser);

      try {
        await apiClient.updateUserBalance(currentUser.id, newBalance);
      } catch (error) {
        console.warn('⚠️ Failed to sync balance with backend:', error);
      }
    }
  },

  updateUserProfile: async (updates: Partial<User>): Promise<void> => {
    if (currentUser) {
      Object.assign(currentUser, updates);
      await UserStorage.saveProfile(currentUser);

      try {
        await apiClient.updateUser(currentUser.id, updates);
      } catch (error) {
        console.warn('⚠️ Failed to sync profile with backend:', error);
      }
    }
  },
};
