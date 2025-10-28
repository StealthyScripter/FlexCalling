import type { Contact, User, CallUIData, EnrichedCallLog } from '@/types';
import {
  ContactStorage,
  CallLogStorage,
  UserStorage,
  StorageService,
} from './storage.service';

// Export types
export type { Contact, User, EnrichedCallLog };

// In-memory cache (for performance)
let contacts: Contact[] = [];
let callLogs: CallUIData[] = [];
let currentUserId: string | null = null;
let users: User[] = [];

// Flag to track if data is loaded
let isInitialized = false;

// Default data (used only on first install)
const DEFAULT_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    phone: '+254712345678',
    favorite: true,
    avatarColor: '#EC4899',
  },
  {
    id: '2',
    name: 'Bob Williams',
    phone: '+254722456789',
    favorite: false,
    avatarColor: '#3B82F6',
  },
  {
    id: '3',
    name: 'Carol Davis',
    phone: '+254734564890',
    favorite: true,
    avatarColor: '#F59E0B',
  },
  {
    id: '4',
    name: 'David Brown',
    phone: '+254745678301',
    favorite: false,
    avatarColor: '#8B5CF6',
  },
];

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
// INITIALIZATION
// ============================================

/**
 * Initialize the API service - load data from storage
 * MUST be called before using any other API methods
 */
async function initialize(): Promise<void> {
  if (isInitialized) {
    console.log('ℹ️ API Service already initialized');
    return;
  }

  console.log('🚀 Initializing API Service...');

  try {
    // Load data from storage
    const stored = await StorageService.initialize();

    // If no stored data, use defaults
    if (stored.contacts.length === 0) {
      console.log('📦 No stored contacts, using defaults');
      contacts = [...DEFAULT_CONTACTS];
      await ContactStorage.save(contacts);
    } else {
      contacts = stored.contacts;
    }

    if (!stored.user) {
      console.log('📦 No stored user, using default');
      const defaultUser = DEFAULT_USERS[0];
      users = DEFAULT_USERS;
      currentUserId = defaultUser.id;
      await UserStorage.saveProfile(defaultUser);
      await UserStorage.setCurrentUserId(defaultUser.id);
    } else {
      users = [stored.user];
      const userId = await UserStorage.getCurrentUserId();
      currentUserId = userId || stored.user.id;
    }

    callLogs = stored.callLogs;

    isInitialized = true;
    console.log('✅ API Service initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize API Service:', error);
    // Use defaults if initialization fails
    contacts = [...DEFAULT_CONTACTS];
    users = [...DEFAULT_USERS];
    currentUserId = DEFAULT_USERS[0].id;
    isInitialized = true;
  }
}

// ============================================
// CONTACTS
// ============================================

export const APIService = {
  // Expose initialize method
  initialize,

  // ============================================
  // CONTACTS
  // ============================================

  getContacts: (): Contact[] => {
    if (!isInitialized) {
      console.warn('⚠️ API Service not initialized, returning empty array');
      return [];
    }
    return [...contacts];
  },

  getContactById: (id: string): Contact | undefined => {
    return contacts.find((c) => c.id === id);
  },

  getContactByPhone: (phone: string): Contact | undefined => {
    return contacts.find((c) => c.phone === phone);
  },

  addContact: async (contact: Contact): Promise<void> => {
    contacts.push(contact);
    await ContactStorage.save(contacts);
    console.log('✅ Contact added and persisted:', contact.name);
  },

  updateContact: async (
    id: string,
    updates: Partial<Contact>
  ): Promise<Contact | null> => {
    const index = contacts.findIndex((c) => c.id === id);
    if (index !== -1) {
      contacts[index] = { ...contacts[index], ...updates };
      await ContactStorage.save(contacts);
      console.log('✅ Contact updated and persisted:', contacts[index].name);
      return contacts[index];
    }
    return null;
  },

  deleteContact: async (id: string): Promise<boolean> => {
    const index = contacts.findIndex((c) => c.id === id);
    if (index !== -1) {
      const deletedContact = contacts[index];
      contacts.splice(index, 1);
      await ContactStorage.save(contacts);
      console.log('✅ Contact deleted and persisted:', deletedContact.name);
      return true;
    }
    return false;
  },

  clearContacts: async (): Promise<void> => {
    contacts = [];
    await ContactStorage.clear();
    console.log('✅ All contacts cleared');
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
      console.warn('⚠️ API Service not initialized, returning empty array');
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
      console.warn('Invalid call data, skipping save');
      return;
    }

    // Check for duplicate
    const isDuplicate = callLogs.some(
      (log) => log.call?.callSid === call.call?.callSid
    );

    if (isDuplicate) {
      console.log(
        'Duplicate call log detected, skipping save for callSid:',
        call.call.callSid
      );
      return;
    }

    // Add to memory cache
    callLogs.push(call);

    // Persist to storage
    await CallLogStorage.append(call);

    console.log('✅ Call log saved and persisted:', {
      callSid: call.call.callSid,
      duration: call.callDuration,
      cost: call.estimatedCost,
      timestamp: call.callStartTime,
    });
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
    console.log('✅ All call logs cleared');
  },
};

// ============================================
// USER/ACCOUNT MANAGEMENT
// ============================================

export const mockDatabase = {
  getCurrentUser: (): User | null => {
    if (!isInitialized || !currentUserId) return null;
    return users.find((u) => u.id === currentUserId) || null;
  },

  setCurrentUser: async (id: string): Promise<void> => {
    if (users.some((u) => u.id === id)) {
      currentUserId = id;
      await UserStorage.setCurrentUserId(id);
      console.log('✅ Current user set and persisted:', id);
    } else {
      console.warn('User ID not found');
    }
  },

  updateUserBalance: async (id: string, newBalance: number): Promise<void> => {
    const user = users.find((u) => u.id === id);
    if (user) {
      user.balance = newBalance;
      await UserStorage.updateBalance(id, newBalance);
      console.log('✅ User balance updated and persisted:', newBalance);
    }
  },

  updateUserProfile: async (id: string, updates: Partial<User>): Promise<void> => {
    const user = users.find((u) => u.id === id);
    if (user) {
      Object.assign(user, updates);
      await UserStorage.saveProfile(user);
      console.log('✅ User profile updated and persisted');
    }
  },
};
