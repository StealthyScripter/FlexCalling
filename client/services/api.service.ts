import { CallUIData } from '@/types/twilio';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  favorite: boolean;
  avatarColor: string;
}

export interface CallLog {
  id: string;
  to: string;
  type: 'incoming' | 'outgoing' | 'missed';
  duration: number; // in seconds
  timestamp: number;
  cost: number;
}

// Mock contacts database
let contacts: Contact[] = [
  { id: '1', name: 'Alice Johnson', phone: '+254712345678', favorite: true, avatarColor: '#EC4899' },
  { id: '2', name: 'Bob Williams', phone: '+254723456789', favorite: false, avatarColor: '#3B82F6' },
  { id: '3', name: 'Carol Davis', phone: '+254734567890', favorite: true, avatarColor: '#F59E0B' },
  { id: '4', name: 'David Brown', phone: '+254745678901', favorite: false, avatarColor: '#8B5CF6' },
];

let callLogs: CallUIData[] = [];

export const APIService = {
  getContacts: (): Contact[] => [...contacts],

  addContact: (contact: Contact) => {
    contacts.push(contact);
  },

  clearContacts: () => {
    contacts = [];
  },

  getCallLogs: (): CallUIData[] => {
    // Sort by most recent first
    return [...callLogs].sort((a, b) => {
      const aTime = a.callStartTime?.getTime() ?? 0;
      const bTime = b.callStartTime?.getTime() ?? 0;
      return bTime - aTime;
    });
  },

  saveCallLog: (call: CallUIData) => {
    callLogs.push(call);
  },

  clearCallLogs: () => {
    callLogs = [];
  },
};
