import { CallUIData } from '@/types/twilio';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  favorite: boolean;
  avatarColor: string;
}

// Mock contacts database
let contacts: Contact[] = [
  { id: '1', name: 'Alice Johnson', phone: '+254712345678', favorite: true, avatarColor: '#EC4899' },
  { id: '2', name: 'Bob Williams', phone: '+254723456789', favorite: false, avatarColor: '#3B82F6' },
  { id: '3', name: 'Carol Davis', phone: '+254734567890', favorite: true, avatarColor: '#F59E0B' },
  { id: '4', name: 'David Brown', phone: '+254745678901', favorite: false, avatarColor: '#8B5CF6' },
];

// FIXED: Add initial mock call logs with proper phone numbers matching contacts
let callLogs: CallUIData[] = [
  {
    call: {
      callSid: 'CA001',
      from: '+1234567890',
      to: '+254712345678', // Alice Johnson
      state: 'connected',
      direction: 'outgoing',
      isMuted: false,
      isOnHold: false,
    },
    incomingCallInvite: null,
    callStartTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    callDuration: 125,
    ratePerMinute: 0.15,
    estimatedCost: 0.31,
  },
  {
    call: {
      callSid: 'CA002',
      from: '+254723456789', // Bob Williams
      to: '+1234567890',
      state: 'connected',
      direction: 'incoming',
      isMuted: false,
      isOnHold: false,
    },
    incomingCallInvite: null,
    callStartTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    callDuration: 320,
    ratePerMinute: 0.15,
    estimatedCost: 0.80,
  },
  {
    call: {
      callSid: 'CA003',
      from: '+1234567890',
      to: '+254734567890', // Carol Davis
      state: 'connected',
      direction: 'outgoing',
      isMuted: false,
      isOnHold: false,
    },
    incomingCallInvite: null,
    callStartTime: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    callDuration: 540,
    ratePerMinute: 0.15,
    estimatedCost: 1.35,
  },
];

export interface EnrichedCallLog extends CallUIData {
  contactName?: string;
  contactId?: string;
  contactAvatar?: string;
}

export const APIService = {
  getContacts: (): Contact[] => [...contacts],

  getContactById: (id: string): Contact | undefined => {
    return contacts.find(c => c.id === id);
  },

  getContactByPhone: (phone: string): Contact | undefined => {
    return contacts.find(c => c.phone === phone);
  },

  addContact: (contact: Contact) => {
    contacts.push(contact);
  },

  clearContacts: () => {
    contacts = [];
  },

  // Helper to enrich a single call log with contact info
  enrichCallLog: (callLog: CallUIData): EnrichedCallLog => {
    if (!callLog.call) return callLog;

    // Determine the phone number to look up based on call direction
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

  // Return enriched call logs
  getCallLogs: (): EnrichedCallLog[] => {
    // Sort by most recent first and enrich with contact data
    return [...callLogs]
      .sort((a, b) => {
        const aTime = a.callStartTime?.getTime() ?? 0;
        const bTime = b.callStartTime?.getTime() ?? 0;
        return bTime - aTime;
      })
      .map(log => APIService.enrichCallLog(log));
  },

  // UPDATED: Add deduplication to prevent duplicate saves
  saveCallLog: (call: CallUIData) => {
    if (!call.call || !call.callStartTime) {
      console.warn('Invalid call data, skipping save');
      return;
    }

    // Check for duplicate by callSid to prevent duplicate saves
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

  clearCallLogs: () => {
    callLogs = [];
  },

  // Get enriched call history for specific contact
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

};

export interface User {
  id: string;
  name: string;
  phone: string;
  balance: number;
  email: string;
}

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
  setCurrentUser: (id: string) => {
    if (users.some(u => u.id === id)) {
      currentUserId = id;
    } else {
      console.warn('User ID not found');
    }
  },
  updateUserBalance: (id: string, newBalance: number) => {
    const user = users.find(u => u.id === id);
    if (user) user.balance = newBalance;
  },
};
