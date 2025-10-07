// ============================================
// TWILIO DATA SCHEMA FOR FLEXCALLING APP
// ============================================

// --------------------------------------------
// 1. USER & ACCOUNT DATA
// --------------------------------------------
interface User {
  id: string;
  phoneNumber: string; // E.164 format: +1234567890
  email: string;
  firstName: string;
  lastName: string;
  accountBalance: number; // in USD
  twilioPhoneNumber?: string; // Assigned Twilio number
  createdAt: Date;
  updatedAt: Date;
}

// --------------------------------------------
// 2. MAKING AN OUTBOUND CALL
// --------------------------------------------
interface MakeCallRequest {
  // Required
  to: string; // Destination number in E.164: +254712345678
  from: string; // Your Twilio number in E.164: +1234567890
  url: string; // TwiML webhook URL for call instructions

  // Optional but recommended
  statusCallback?: string; // URL to receive call status updates
  statusCallbackEvent?: ('initiated' | 'ringing' | 'answered' | 'completed')[];
  statusCallbackMethod?: 'GET' | 'POST';

  // Call behavior settings
  record?: boolean; // Enable call recording
  recordingStatusCallback?: string; // URL for recording notifications
  timeout?: number; // Seconds to wait for answer (default: 60)
  machineDetection?: 'Enable' | 'DetectMessageEnd'; // Voicemail detection

  // Additional metadata
  callerId?: string; // Custom caller ID (if verified)
  sendDigits?: string; // DTMF tones to send after connection
}

interface MakeCallResponse {
  callSid: string; // Unique call identifier from Twilio
  status: 'queued' | 'initiated' | 'ringing' | 'in-progress' | 'completed';
  direction: 'outbound-api';
  from: string;
  to: string;
  dateCreated: Date;
  estimatedCostPerMinute: number; // Rate for Kenya: ~$0.15-0.30/min
}

// --------------------------------------------
// 3. INCOMING CALL DATA (Webhook Payload)
// --------------------------------------------
interface IncomingCallWebhook {
  // Call identifiers
  CallSid: string;
  AccountSid: string;

  // Caller information
  From: string; // Caller's number in E.164
  To: string; // Your Twilio number that was called
  CallerName?: string; // Caller ID name if available

  // Geographic data
  FromCity?: string;
  FromState?: string;
  FromCountry: string; // ISO country code: "KE" for Kenya
  FromZip?: string;

  ToCity?: string;
  ToState?: string;
  ToCountry: string;
  ToZip?: string;

  // Call metadata
  CallStatus: 'ringing' | 'in-progress' | 'completed' | 'busy' | 'no-answer';
  Direction: 'inbound';
  ApiVersion: string;

  // Additional fields
  ForwardedFrom?: string; // If call was forwarded
  CallerCountry?: string;
}

// Response to incoming call webhook (TwiML)
interface IncomingCallResponse {
  action: 'accept' | 'reject' | 'voicemail';
  twimlInstructions: string; // XML TwiML response
}

// --------------------------------------------
// 4. ACTIVE CALL DATA
// --------------------------------------------
interface ActiveCall {
  // Core identifiers
  callSid: string;
  accountSid: string;

  // Participant information
  from: string;
  to: string;
  callerName?: string;

  // Call state
  status: 'in-progress' | 'ringing' | 'queued';
  direction: 'inbound' | 'outbound-api' | 'outbound-dial';

  // Time tracking
  startTime: Date;
  duration: number; // Seconds elapsed

  // Cost tracking
  pricePerMinute: number; // Rate in USD
  currentCost: number; // Accumulated cost

  // Call quality
  quality: 'HD' | 'Standard';

  // Control states (client-side)
  isMuted: boolean;
  isSpeakerOn: boolean;
  isRecording: boolean;

  // Geographic data
  callerLocation?: {
    city?: string;
    country: string;
    countryCode: string; // "KE"
  };
}

// Call control actions
interface CallControlRequest {
  callSid: string;
  action: 'mute' | 'unmute' | 'hold' | 'unhold' | 'hangup' |
          'transfer' | 'record' | 'send-digits';

  // Action-specific parameters
  transferTo?: string; // For transfer action
  digits?: string; // For send-digits action
  recordingChannels?: 'mono' | 'dual'; // For record action
}

interface CallControlResponse {
  success: boolean;
  callSid: string;
  updatedStatus: string;
  message?: string;
}

// --------------------------------------------
// 5. CALL HISTORY / COMPLETED CALL DATA
// --------------------------------------------
interface CallRecord {
  // Identifiers
  callSid: string;
  accountSid: string;

  // Participants
  from: string;
  to: string;
  contactId?: string; // Link to contacts table
  contactName?: string;

  // Call details
  type: 'outgoing' | 'incoming' | 'missed';
  status: 'completed' | 'busy' | 'no-answer' | 'failed' | 'canceled';
  direction: 'inbound' | 'outbound-api';

  // Time data
  dateCreated: Date;
  dateUpdated: Date;
  startTime?: Date;
  endTime?: Date;
  duration: number; // In seconds

  // Cost data
  price: number; // Total cost in USD
  priceUnit: string; // "USD"
  pricePerMinute: number;

  // Quality metrics
  quality: 'HD' | 'Standard';
  answeredBy?: 'human' | 'machine';

  // Geographic data
  fromCity?: string;
  fromState?: string;
  fromCountry: string;
  fromZip?: string;
  toCity?: string;
  toState?: string;
  toCountry: string;

  // Recording data
  recordingUrl?: string;
  recordingDuration?: number;
  recordingSid?: string;

  // Additional metadata
  forwardedFrom?: string;
  callerName?: string;
  parentCallSid?: string; // For transferred calls
}

// Call history query parameters
interface CallHistoryQuery {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  type?: 'outgoing' | 'incoming' | 'missed';
  status?: 'completed' | 'busy' | 'no-answer' | 'failed';
  contactId?: string;
  limit?: number;
  offset?: number;
}

// --------------------------------------------
// 6. CONTACT DATA
// --------------------------------------------
interface Contact {
  id: string;
  userId: string;

  // Personal info
  firstName: string;
  lastName: string;
  phoneNumber: string; // E.164 format
  email?: string;

  // Additional details
  location?: string; // "Nairobi, Kenya"
  avatarUrl?: string;
  avatarColor: string; // For UI: "#EC4899"

  // Preferences
  isFavorite: boolean;
  isBlocked: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastCallDate?: Date;
  totalCalls?: number;
  totalDuration?: number; // In seconds
  totalSpent?: number; // In USD
}

// --------------------------------------------
// 7. REAL-TIME STATUS UPDATES (Webhooks)
// --------------------------------------------
interface CallStatusUpdate {
  // Identifiers
  CallSid: string;
  AccountSid: string;

  // Updated status
  CallStatus: 'initiated' | 'ringing' | 'in-progress' | 'completed' |
              'busy' | 'failed' | 'no-answer' | 'canceled';

  // Participants
  From: string;
  To: string;

  // Timestamp
  Timestamp: string; // ISO 8601 format

  // Duration (for completed calls)
  CallDuration?: string; // In seconds

  // Recording info (if enabled)
  RecordingUrl?: string;
  RecordingSid?: string;
  RecordingDuration?: string;

  // Error info (for failed calls)
  ErrorCode?: string;
  ErrorMessage?: string;
}

// --------------------------------------------
// 8. PRICING & BILLING DATA
// --------------------------------------------
interface PricingRate {
  country: string; // "Kenya"
  countryCode: string; // "KE"
  prefix: string; // "+254"

  // Rates per minute
  mobileRate: number; // ~$0.15-0.30/min
  landlineRate: number; // ~$0.15-0.30/min

  currency: 'USD';
  effectiveDate: Date;
}

interface BillingRecord {
  id: string;
  userId: string;
  callSid: string;

  // Transaction details
  amount: number; // Cost in USD
  currency: 'USD';
  type: 'call_charge' | 'top_up' | 'refund';

  // Call details (for call charges)
  duration?: number; // Seconds
  ratePerMinute?: number;
  destination?: string; // Country

  // Balance tracking
  balanceBefore: number;
  balanceAfter: number;

  timestamp: Date;
  description: string;
}

// --------------------------------------------
// 9. TWIML CONFIGURATION
// --------------------------------------------
interface TwiMLConfig {
  // For outbound calls
  outboundCallUrl: string; // Your webhook endpoint

  // For incoming calls
  incomingCallUrl: string;

  // For call status updates
  statusCallbackUrl: string;

  // For recordings
  recordingStatusCallbackUrl: string;

  // Voice settings
  voice?: 'man' | 'woman' | 'alice';
  language?: 'en-US' | 'en-GB';
}

// Example TwiML response structure
interface TwiMLResponse {
  xml: string; // The actual TwiML XML
  contentType: 'text/xml';
}

// --------------------------------------------
// 10. ERROR HANDLING
// --------------------------------------------
interface TwilioError {
  code: number;
  message: string;
  moreInfo: string; // URL to Twilio docs
  status: number; // HTTP status code

  // Context
  callSid?: string;
  timestamp: Date;
}

// Common Twilio error codes
enum TwilioErrorCode {
  INVALID_PHONE_NUMBER = 21211,
  PERMISSION_DENIED = 20003,
  INSUFFICIENT_FUNDS = 20429,
  CALL_NOT_FOUND = 20404,
  INVALID_TWIML = 12100,
  CALL_TIMEOUT = 31205,
  BUSY = 30003,
  NO_ANSWER = 30002,
}

// --------------------------------------------
// 11. FRONTEND UI STATE
// --------------------------------------------
interface CallUIState {
  // Active call screen
  activeCall?: ActiveCall;
  isCallActive: boolean;

  // Incoming call modal
  incomingCall?: IncomingCallWebhook;
  showIncomingCallModal: boolean;

  // Keypad
  dialedNumber: string;
  selectedCountry: {
    name: string;
    code: string;
    dialCode: string; // "+254"
  };

  // Call history filters
  historyFilter: 'all' | 'missed' | 'incoming' | 'outgoing';
  historyDateRange: {
    start: Date;
    end: Date;
  };
}

// --------------------------------------------
// EXPORT ALL TYPES
// --------------------------------------------
export type {
  User,
  MakeCallRequest,
  MakeCallResponse,
  IncomingCallWebhook,
  IncomingCallResponse,
  ActiveCall,
  CallControlRequest,
  CallControlResponse,
  CallRecord,
  CallHistoryQuery,
  Contact,
  CallStatusUpdate,
  PricingRate,
  BillingRecord,
  TwiMLConfig,
  TwiMLResponse,
  TwilioError,
  CallUIState,
};

export { TwilioErrorCode };