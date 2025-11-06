// client/types/index.ts
// --------------------------------------------
// 1. USER & ACCOUNT TYPES
// --------------------------------------------
export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  password?: string; // Optional as it shouldn't be exposed to frontend
  balance: number;
  isVerified: boolean; // Added to match backend
  createdAt?: Date;
  updatedAt?: Date;
}

// --------------------------------------------
// 2. CONTACT TYPES
// --------------------------------------------
export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  location?: string;
  favorite: boolean;
  avatarColor: string;
  isBlocked?: boolean;
  userId?: string; // Added to match backend (optional as frontend may not always need it)
  createdAt?: Date;
  updatedAt?: Date;
  lastCallDate?: Date;
  totalCalls?: number;
  totalDuration?: number;
  totalSpent?: number;
}

// --------------------------------------------
// 3. TWILIO CALL TYPES
// --------------------------------------------
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

export interface CallInvite {
  callSid: string;
  from: string;
  to: string;
  customParameters?: Record<string, string>;
}

export interface ConnectOptions {
  accessToken: string;
  params?: {
    To: string;
    From?: string;
    [key: string]: any;
  };
}

// --------------------------------------------
// 4. CALL UI & HISTORY TYPES
// --------------------------------------------
export interface CallUIData {
  call: Call | null;
  incomingCallInvite: CallInvite | null;
  callStartTime: Date | null;
  callDuration: number;
  ratePerMinute: number;
  estimatedCost: number;
}

export interface EnrichedCallLog extends CallUIData {
  contactName?: string;
  contactId?: string;
  contactAvatar?: string;
}

// Backend call history format
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
  duration: number;
  cost: number;
  ratePerMinute: number;
  contactName?: string;
  contactId?: string;
  location?: string;
  recordingUrl?: string;
}

// --------------------------------------------
// 5. AUDIO DEVICE TYPES
// --------------------------------------------
export type AudioDeviceType =
  | 'speaker'
  | 'earpiece'
  | 'bluetooth'
  | 'wired-headset';

export interface AudioDevice {
  uuid: string;
  name: string;
  type: AudioDeviceType;
}

// --------------------------------------------
// 6. ERROR TYPES
// --------------------------------------------
export interface TwilioError {
  code: number;
  message: string;
  explanation?: string;
}

export enum TwilioErrorCode {
  INVALID_TOKEN = 20101,
  TOKEN_EXPIRED = 20104,
  INVALID_PARAMETER = 21211,
  CALL_TIMEOUT = 31205,
  CONNECTION_DECLINED = 31002,
  CONNECTION_ERROR = 31005,
  INSUFFICIENT_PERMISSIONS = 20003,
}

// --------------------------------------------
// 7. EVENT TYPES
// --------------------------------------------
export type TwilioEvent =
  | 'deviceReady'
  | 'deviceNotReady'
  | 'deviceError'
  | 'callInvite'
  | 'callInviteAccepted'
  | 'callInviteCancelled'
  | 'callConnecting'
  | 'callConnected'
  | 'callDisconnected'
  | 'callReconnecting'
  | 'callReconnected'
  | 'callFailed'
  | 'audioDeviceChanged';

export interface DeviceReadyEvent {
  device: string;
}

export interface DeviceErrorEvent {
  error: string;
  code?: number;
}

export interface CallConnectingEvent {
  call: Call;
}

export interface CallConnectedEvent {
  call: Call;
}

export interface CallDisconnectedEvent {
  call: Call;
  error?: TwilioError;
}

export interface CallInviteEvent {
  callInvite: CallInvite;
}

export interface AudioDeviceChangedEvent {
  selectedDevice: AudioDevice;
  availableDevices: AudioDevice[];
}

// --------------------------------------------
// 8. PRICING & BILLING TYPES
// --------------------------------------------
export interface PricingRate {
  country: string;
  countryCode: string;
  prefix: string;
  mobileRate: number;
  landlineRate: number;
  currency: 'USD';
  effectiveDate: Date;
}

export interface BillingRecord {
  id: string;
  userId: string;
  callSid: string;
  amount: number;
  currency: 'USD';
  type: 'call_charge' | 'top_up' | 'refund';
  duration?: number;
  ratePerMinute?: number;
  destination?: string;
  balanceBefore: number;
  balanceAfter: number;
  timestamp: Date;
  description: string;
}

// --------------------------------------------
// 9. API REQUEST/RESPONSE TYPES
// --------------------------------------------
export interface MakeCallRequest {
  to: string;
  from: string;
  url: string;
  statusCallback?: string;
  statusCallbackEvent?: ('initiated' | 'ringing' | 'answered' | 'completed')[];
  statusCallbackMethod?: 'GET' | 'POST';
  record?: boolean;
  recordingStatusCallback?: string;
  timeout?: number;
  machineDetection?: 'Enable' | 'DetectMessageEnd';
  callerId?: string;
  sendDigits?: string;
}

export interface MakeCallResponse {
  callSid: string;
  status: 'queued' | 'initiated' | 'ringing' | 'in-progress' | 'completed';
  direction: 'outbound-api';
  from: string;
  to: string;
  dateCreated: Date;
  estimatedCostPerMinute: number;
}

// --------------------------------------------
// 10. WEBHOOK TYPES
// --------------------------------------------
export interface IncomingCallWebhook {
  CallSid: string;
  AccountSid: string;
  From: string;
  To: string;
  CallerName?: string;
  FromCity?: string;
  FromState?: string;
  FromCountry: string;
  FromZip?: string;
  ToCity?: string;
  ToState?: string;
  ToCountry: string;
  ToZip?: string;
  CallStatus: 'ringing' | 'in-progress' | 'completed' | 'busy' | 'no-answer';
  Direction: 'inbound';
  ApiVersion: string;
  ForwardedFrom?: string;
  CallerCountry?: string;
}

export interface CallStatusUpdate {
  CallSid: string;
  AccountSid: string;
  CallStatus: 'initiated' | 'ringing' | 'in-progress' | 'completed' |
              'busy' | 'failed' | 'no-answer' | 'canceled';
  From: string;
  To: string;
  Timestamp: string;
  CallDuration?: string;
  RecordingUrl?: string;
  RecordingSid?: string;
  RecordingDuration?: string;
  ErrorCode?: string;
  ErrorMessage?: string;
}

// --------------------------------------------
// 11. AUTH TYPES (Frontend specific)
// --------------------------------------------
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  error?: string;
}

// --------------------------------------------
// 12. API RESPONSE WRAPPER (Backend format)
// --------------------------------------------
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: {
    msg: string;
    param?: string;
  }[];
}
