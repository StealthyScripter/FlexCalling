export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  balance: number;
  isVerified: boolean;
  role: UserRole;
  totalCallDuration: number; // Total minutes of calls
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  location?: string;
  favorite: boolean;
  avatarColor: string;
  isBlocked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  lastCallDate?: Date;
  totalCalls?: number;
  totalDuration?: number;
  totalSpent?: number;
}

export type CallState =
  | 'pending'
  | 'connecting'
  | 'ringing'
  | 'connected'
  | 'reconnecting'
  | 'disconnected';

export type CallDirection = 'incoming' | 'outgoing';

export interface Call {
  callSid: string;
  from: string;
  to: string;
  state: CallState;
  direction: CallDirection;
  isMuted: boolean;
  isOnHold: boolean;
  customParameters?: Record<string, string>;
}

export interface CallHistoryRecord {
  id: string;
  callSid: string;
  from: string;
  to: string;
  direction: CallDirection;
  status: 'completed' | 'missed' | 'failed' | 'busy' | 'no-answer';
  date: Date;
  startTime: Date | null;
  endTime: Date | null;
  duration: number; // in seconds
  cost: number;
  ratePerMinute: number;
  contactName?: string;
  contactId?: string;
  location?: string;
  recordingUrl?: string;
}

export interface TwilioTokenResponse {
  token: string;
  identity: string;
  expiresAt: Date;
}

export interface MakeCallRequest {
  to: string;
  from: string;
}

export interface MakeCallResponse {
  callSid: string;
  status: string;
  direction: string;
  from: string;
  to: string;
  dateCreated: Date;
  estimatedCostPerMinute: number;
}

export interface UserStats {
  totalCalls: number;
  completedCalls: number;
  totalSpent: number;
  totalDuration: number; // in minutes
  averageCallDuration: number; // in minutes
  currentBalance: number;
  callsByDay: Array<{
    date: Date;
    count: number;
    totalCost: number;
    totalDuration: number;
  }>;
}

export interface PlatformStats {
  users: {
    total: number;
    admins: number;
    active: number;
  };
  calls: {
    total: number;
    recentByDay: Array<{
      date: Date;
      count: number;
    }>;
  };
  revenue: {
    total: number;
    currency: string;
  };
}
