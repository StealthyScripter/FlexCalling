// // --------------------------------------------
// // 1. CALL STATE & STATUS
// // --------------------------------------------
// export type CallState =
//   | 'pending'      // Call is being initiated
//   | 'connecting'   // Attempting to connect
//   | 'ringing'      // Phone is ringing
//   | 'connected'    // Call is active
//   | 'reconnecting' // Attempting to reconnect
//   | 'disconnected'; // Call ended

// export type CallDirection = 'incoming' | 'outgoing';

// // --------------------------------------------
// // 2. CALL OBJECT (Core Data Structure)
// // --------------------------------------------
// export interface Call {
//   // Identifiers
//   callSid: string;              // Unique call ID from Twilio

//   // Participants
//   from: string;                 // Caller number (E.164: +1234567890)
//   to: string;                   // Recipient number (E.164: +254712345678)

//   // State
//   state: CallState;
//   direction: CallDirection;

//   // Control states
//   isMuted: boolean;
//   isOnHold: boolean;

//   // Custom parameters (passed during call)
//   customParameters?: Record<string, string>;
// }

// // --------------------------------------------
// // 3. CALL INVITE (Incoming Call)
// // --------------------------------------------
// export interface CallInvite {
//   callSid: string;
//   from: string;                 // Caller number
//   to: string;                   // Your Twilio number
//   customParameters?: Record<string, string>;
// }

// // --------------------------------------------
// // 4. MAKE CALL PARAMETERS
// // --------------------------------------------
// export interface ConnectOptions {
//   accessToken: string;          // JWT token from your backend
//   params?: {
//     To: string;                 // Destination number
//     From?: string;              // Your Twilio number
//     [key: string]: any;         // Additional custom params
//   };
// }

// // --------------------------------------------
// // 5. DEVICE EVENTS
// // --------------------------------------------
// export type TwilioEvent =
//   // Device events
//   | 'deviceReady'
//   | 'deviceNotReady'
//   | 'deviceError'

//   // Call lifecycle events
//   | 'callInvite'
//   | 'callInviteAccepted'
//   | 'callInviteCancelled'
//   | 'callConnecting'
//   | 'callConnected'
//   | 'callDisconnected'
//   | 'callReconnecting'
//   | 'callReconnected'
//   | 'callFailed'

//   // Audio events
//   | 'audioDeviceChanged';

// // --------------------------------------------
// // 6. EVENT PAYLOADS
// // --------------------------------------------
// export interface DeviceReadyEvent {
//   device: string;
// }

// export interface DeviceErrorEvent {
//   error: string;
//   code?: number;
// }

// export interface CallConnectingEvent {
//   call: Call;
// }

// export interface CallConnectedEvent {
//   call: Call;
// }

// export interface CallDisconnectedEvent {
//   call: Call;
//   error?: TwilioError;
// }

// export interface CallInviteEvent {
//   callInvite: CallInvite;
// }

// export interface AudioDeviceChangedEvent {
//   selectedDevice: AudioDevice;
//   availableDevices: AudioDevice[];
// }

// // --------------------------------------------
// // 7. AUDIO DEVICES
// // --------------------------------------------
// export type AudioDeviceType =
//   | 'speaker'
//   | 'earpiece'
//   | 'bluetooth'
//   | 'wired-headset';

// export interface AudioDevice {
//   uuid: string;
//   name: string;
//   type: AudioDeviceType;
// }

// // --------------------------------------------
// // 8. ERRORS
// // --------------------------------------------
// export interface TwilioError {
//   code: number;
//   message: string;
//   explanation?: string;
// }

// // Common error codes
// export enum TwilioErrorCode {
//   INVALID_TOKEN = 20101,
//   TOKEN_EXPIRED = 20104,
//   INVALID_PARAMETER = 21211,
//   CALL_TIMEOUT = 31205,
//   CONNECTION_DECLINED = 31002,
//   CONNECTION_ERROR = 31005,
//   INSUFFICIENT_PERMISSIONS = 20003,
// }

// // --------------------------------------------
// // 9. UI STATE (for React components)
// // --------------------------------------------
// export interface CallUIData {
//   // Active call
//   call: Call | null;

//   // Incoming call
//   incomingCallInvite: CallInvite | null;

//   // Time tracking
//   callStartTime: Date | null;
//   callDuration: number; // seconds

//   // Cost tracking
//   ratePerMinute: number;
//   estimatedCost: number;

//   // Contact info (enriched data)
//   contactName?: string;
//   contactAvatar?: string;
//   contactLocation?: string;
// }

// // --------------------------------------------
// // 10. CALL HISTORY RECORD
// // --------------------------------------------
// export interface CallHistoryRecord {
//   id: string;
//   callSid: string;

//   // Participants
//   from: string;
//   to: string;
//   direction: CallDirection;

//   // Status
//   status: 'completed' | 'missed' | 'failed' | 'busy' | 'no-answer';

//   // Time
//   date: Date;
//   startTime: Date | null;
//   endTime: Date | null;
//   duration: number; // seconds

//   // Cost
//   cost: number;
//   ratePerMinute: number;

//   // Enriched data
//   contactName?: string;
//   contactId?: string;
//   location?: string;

//   // Recording
//   recordingUrl?: string;
// }

// // --------------------------------------------
// // 11. PRICING INFO
// // --------------------------------------------
// export interface CallPricing {
//   country: string;
//   countryCode: string;
//   prefix: string;
//   ratePerMinute: number;
//   currency: 'USD';
// }