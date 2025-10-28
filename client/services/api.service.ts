import type { Contact, User, CallUIData, EnrichedCallLog } from '@/types';

// Re-export Contact type so other files can import it from here if needed
export type { Contact, User, EnrichedCallLog };

// Mock contacts database
let contacts: Contact[] = [
  { id: '1', name: 'Alice Johnson', phone: '+254712345678', favorite: true, avatarColor: '#EC4899' },
  { id: '2', name: 'Bob Williams', phone: '+254723456789', favorite: false, avatarColor: '#3B82F6' },
  { id: '3', name: 'Carol Davis', phone: '+254734567890', favorite: true, avatarColor: '#F59E0B' },
  { id: '4', name: 'David Brown', phone: '+254745678901', favorite: false, avatarColor: '#8B5CF6' },
];

// Initial mock call logs with proper phone numbers matching contacts
let callLogs: CallUIData[] = [
  {
    call: {
      callSid: 'CA001',
      from: '+1234567890',
      to: '+254712345678',
      state: 'connected',
      direction: 'outgoing',
      isMuted: false,
      isOnHold: false,
    },
    incomingCallInvite: null,
    callStartTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    callDuration: 125,
    ratePerMinute: 0.15,
    estimatedCost: 0.31,
  },
  {
    call: {
      callSid: 'CA002',
      from: '+254723456789',
      to: '+1234567890',
      state: 'connected',
      direction: 'incoming',
      isMuted: false,
      isOnHold: false,
    },
    incomingCallInvite: null,
    callStartTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    callDuration: 320,
    ratePerMinute: 0.15,
    estimatedCost: 0.80,
  },
  {
    call: {
      callSid: 'CA003',
      from: '+1234567890',
      to: '+254734567890',
      state: 'connected',
      direction: 'outgoing',
      isMuted: false,
      isOnHold: false,
    },
    incomingCallInvite: null,
    callStartTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
    callDuration: 540,
    ratePerMinute: 0.15,
    estimatedCost: 1.35,
  },
];

export const APIService = {
  // ============================================
  // CONTACTS
  // ============================================

  getContacts: (): Contact[] => [...contacts],

  getContactById: (id: string): Contact | undefined => {
    return contacts.find(c => c.id === id);
  },

  getContactByPhone: (phone: string): Contact | undefined => {
    return contacts.find(c => c.phone === phone);
  },

  addContact: (contact: Contact): void => {
    contacts.push(contact);
  },

  updateContact: (id: string, updates: Partial<Contact>): Contact | null => {
    const index = contacts.findIndex(c => c.id === id);
    if (index !== -1) {
      contacts[index] = { ...contacts[index], ...updates };
      return contacts[index];
    }
    return null;
  },

  deleteContact: (id: string): boolean => {
    const index = contacts.findIndex(c => c.id === id);
    if (index !== -1) {
      contacts.splice(index, 1);
      return true;
    }
    return false;
  },

  clearContacts: (): void => {
    contacts = [];
  },

  // ============================================
  // CALL LOGS
  // ============================================

  enrichCallLog: (callLog: CallUIData): EnrichedCallLog => {
    if (!callLog.call) return callLog;

    const phoneToLookup = callLog.call.direction === 'outgoing'
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
    return [...callLogs]
      .sort((a, b) => {
        const aTime = a.callStartTime?.getTime() ?? 0;
        const bTime = b.callStartTime?.getTime() ?? 0;
        return bTime - aTime;
      })
      .map(log => APIService.enrichCallLog(log));
  },

  saveCallLog: (call: CallUIData): void => {
    if (!call.call || !call.callStartTime) {
      console.warn('Invalid call data, skipping save');
      return;
    }

    // Check for duplicate
    const isDuplicate = callLogs.some(
      log => log.call?.callSid === call.call?.callSid
    );

    if (isDuplicate) {
      console.log('Duplicate call log detected, skipping save for callSid:', call.call.callSid);
      return;
    }

    callLogs.push(call);
    console.log('✅ Call log saved successfully:', {
      callSid: call.call.callSid,
      duration: call.callDuration,
      cost: call.estimatedCost,
      timestamp: call.callStartTime
    });
  },

  getCallLogsForContact: (contactPhone: string): EnrichedCallLog[] => {
    return callLogs
      .filter(log =>
        log.call?.to === contactPhone || log.call?.from === contactPhone
      )
      .sort((a, b) => {
        const aTime = a.callStartTime?.getTime() ?? 0;
        const bTime = b.callStartTime?.getTime() ?? 0;
        return bTime - aTime;
      })
      .map(log => APIService.enrichCallLog(log));
  },

  clearCallLogs: (): void => {
    callLogs = [];
  },
};

// ============================================
// USER/ACCOUNT MANAGEMENT
// ============================================

const users: User[] = [
  {
    id: '1',
    name: 'James Doe',
    phone: '+1 (919) 123-4567',
    balance: 22.5,
    email: 'john.doe@example.com',
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '+254 712 345 678',
    balance: 100.0,
    email: 'jane.smith@example.com',
  },
];

let currentUserId: string | null = '1';

export const mockDatabase = {
  getCurrentUser: (): User | null => {
    return users.find(u => u.id === currentUserId) || null;
  },

  setCurrentUser: (id: string): void => {
    if (users.some(u => u.id === id)) {
      currentUserId = id;
    } else {
      console.warn('User ID not found');
    }
  },

  updateUserBalance: (id: string, newBalance: number): void => {
    const user = users.find(u => u.id === id);
    if (user) user.balance = newBalance;
  },
};
