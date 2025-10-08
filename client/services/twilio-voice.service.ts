import { Voice, Call, CallInvite } from '@twilio/voice-react-native-sdk';
import { Platform, PermissionsAndroid } from 'react-native';

// ============================================
// TWILIO VOICE SERVICE
// ============================================

export interface CallEventHandlers {
  onCallConnected?: (call: Call) => void;
  onCallDisconnected?: (call: Call, error?: any) => void;
  onCallRinging?: (call: Call) => void;
  onIncomingCall?: (callInvite: CallInvite) => void;
  onCallQualityWarning?: (call: Call, warnings: any) => void;
}

export interface TwilioConfig {
  backendUrl: string;
  userId: string;
}

// Event names as constants (since Voice.Event may not have them)
const VOICE_EVENTS = {
  CALL_CONNECTED: 'callConnected',
  CALL_DISCONNECTED: 'callDisconnected',
  CALL_RINGING: 'callRinging',
  CALL_INVITE: 'callInvite',
  CALL_QUALITY_WARNINGS_CHANGED: 'callQualityWarningsChanged',
  REGISTERED: 'registered',
  REGISTRATION_FAILED: 'registrationFailed',
  UNREGISTERED: 'unregistered',
  TOKEN_WILL_EXPIRE: 'tokenWillExpire',
  ERROR: 'error',
} as const;

class TwilioVoiceService {
  private voice: Voice | null = null;
  private activeCall: Call | null = null;
  private isInitialized: boolean = false;
  private eventHandlers: CallEventHandlers = {};
  private config: TwilioConfig | null = null;

  // ============================================
  // 1. INITIALIZATION
  // ============================================

  async initialize(config: TwilioConfig, handlers: CallEventHandlers = {}): Promise<void> {
    try {
      this.config = config;
      this.eventHandlers = handlers;

      // Request permissions
      await this.requestPermissions();

      // Initialize Twilio Voice SDK
      this.voice = new Voice();

      // Set up event listeners BEFORE registering
      this.setupEventListeners();

      // Register device with Twilio
      const accessToken = await this.fetchAccessToken();
      await this.voice.register(accessToken);

      this.isInitialized = true;
      console.log('✅ Twilio Voice SDK initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Twilio Voice SDK:', error);
      throw error;
    }
  }

  // ============================================
  // 2. PERMISSIONS
  // ============================================

  private async requestPermissions(): Promise<void> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.CALL_PHONE,
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        ]);

        const allGranted = Object.values(granted).every(
          (status) => status === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          throw new Error('Required permissions not granted');
        }
      } catch (error) {
        console.error('Permission request failed:', error);
        throw error;
      }
    }
  }

  // ============================================
  // 3. TOKEN MANAGEMENT
  // ============================================

  private async fetchAccessToken(): Promise<string> {
    try {
      if (!this.config) {
        throw new Error('TwilioVoiceService not configured');
      }

      const response = await fetch(`${this.config.backendUrl}/api/twilio/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.config.userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token fetch failed: ${response.status}`);
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Failed to fetch access token:', error);
      throw error;
    }
  }

  async refreshToken(): Promise<void> {
    try {
      const token = await this.fetchAccessToken();
      await this.voice?.register(token);
      console.log('✅ Token refreshed successfully');
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      throw error;
    }
  }

  // ============================================
  // 4. EVENT LISTENERS
  // ============================================

  private setupEventListeners(): void {
    if (!this.voice) return;

    // Use the voice instance's 'on' method with string event names
    // Cast to 'any' to bypass TypeScript issues with event names
    const voiceAny = this.voice as any;

    // Call connected
    voiceAny.on(VOICE_EVENTS.CALL_CONNECTED, (callInfo: any) => {
      const call = callInfo?.call || callInfo;
      console.log('📞 Call connected:', call?.getSid?.());
      this.activeCall = call;
      this.eventHandlers.onCallConnected?.(call);
    });

    // Call disconnected
    voiceAny.on(VOICE_EVENTS.CALL_DISCONNECTED, (callInfo: any) => {
      const call = callInfo?.call || callInfo;
      const error = callInfo?.error;
      console.log('📞 Call disconnected:', call?.getSid?.());
      this.activeCall = null;
      this.eventHandlers.onCallDisconnected?.(call, error);
    });

    // Call ringing
    voiceAny.on(VOICE_EVENTS.CALL_RINGING, (callInfo: any) => {
      const call = callInfo?.call || callInfo;
      console.log('📞 Call ringing:', call?.getSid?.());
      this.eventHandlers.onCallRinging?.(call);
    });

    // Incoming call invite
    voiceAny.on(VOICE_EVENTS.CALL_INVITE, (callInviteInfo: any) => {
      const callInvite = callInviteInfo?.callInvite || callInviteInfo;
      console.log('📞 Incoming call from:', callInvite?.getFrom?.());
      this.eventHandlers.onIncomingCall?.(callInvite);
    });

    // Call quality warnings
    voiceAny.on(VOICE_EVENTS.CALL_QUALITY_WARNINGS_CHANGED, (callInfo: any) => {
      const call = callInfo?.call || callInfo;
      const warnings = callInfo?.currentWarnings;
      console.log('⚠️ Call quality warning:', warnings);
      this.eventHandlers.onCallQualityWarning?.(call, warnings);
    });

    // Registration events
    voiceAny.on(VOICE_EVENTS.REGISTERED, () => {
      console.log('✅ Device registered with Twilio');
    });

    voiceAny.on(VOICE_EVENTS.REGISTRATION_FAILED, (error: any) => {
      console.error('❌ Registration failed:', error);
    });

    voiceAny.on(VOICE_EVENTS.UNREGISTERED, () => {
      console.log('📴 Device unregistered');
    });

    // Token events
    voiceAny.on(VOICE_EVENTS.TOKEN_WILL_EXPIRE, async () => {
      console.log('⏰ Token will expire, refreshing...');
      await this.refreshToken();
    });

    // Error events
    voiceAny.on(VOICE_EVENTS.ERROR, (error: any) => {
      console.error('❌ Voice SDK error:', error);
    });
  }

  // ============================================
  // 5. MAKE OUTBOUND CALL
  // ============================================

  async makeCall(to: string, customParams: Record<string, string> = {}): Promise<Call> {
    try {
      if (!this.isInitialized || !this.voice) {
        throw new Error('Twilio Voice SDK not initialized');
      }

      if (this.activeCall) {
        throw new Error('A call is already in progress');
      }

      console.log(`📞 Making call to: ${to}`);

      // Create connect options
      const connectOptions = {
        params: {
          To: to,
          ...customParams,
        },
      };

      // Call connect - cast to any to handle type mismatches
      const call = await (this.voice as any).connect(connectOptions);
      this.activeCall = call;
      return call;
    } catch (error) {
      console.error('❌ Failed to make call:', error);
      throw error;
    }
  }

  // ============================================
  // 6. ACCEPT/REJECT INCOMING CALL
  // ============================================

  async acceptIncomingCall(callInvite: CallInvite): Promise<Call> {
    try {
      console.log('📞 Accepting incoming call');
      const call = await callInvite.accept();
      this.activeCall = call;
      return call;
    } catch (error) {
      console.error('❌ Failed to accept call:', error);
      throw error;
    }
  }

  async rejectIncomingCall(callInvite: CallInvite): Promise<void> {
    try {
      console.log('📞 Rejecting incoming call');
      await callInvite.reject();
    } catch (error) {
      console.error('❌ Failed to reject call:', error);
      throw error;
    }
  }

  // ============================================
  // 7. CALL CONTROLS
  // ============================================

  async hangup(): Promise<void> {
    try {
      if (!this.activeCall) {
        console.warn('⚠️ No active call to hang up');
        return;
      }

      console.log('📞 Hanging up call');
      await this.activeCall.disconnect();
      this.activeCall = null;
    } catch (error) {
      console.error('❌ Failed to hang up:', error);
      throw error;
    }
  }

  async mute(shouldMute: boolean): Promise<void> {
    try {
      if (!this.activeCall) throw new Error('No active call');
      await this.activeCall.mute(shouldMute);
      console.log(`${shouldMute ? '🔇' : '🔊'} Call ${shouldMute ? 'muted' : 'unmuted'}`);
    } catch (error) {
      console.error('❌ Failed to mute/unmute:', error);
      throw error;
    }
  }

  async toggleMute(): Promise<boolean> {
    try {
      if (!this.activeCall) throw new Error('No active call');
      const isMuted = this.activeCall.isMuted();
      await this.activeCall.mute(!isMuted);
      console.log(`🔊 Call ${!isMuted ? 'muted' : 'unmuted'}`);
      return !isMuted;
    } catch (error) {
      console.error('❌ Failed to toggle mute:', error);
      throw error;
    }
  }

  async hold(shouldHold: boolean): Promise<void> {
    try {
      if (!this.activeCall) throw new Error('No active call');
      await this.activeCall.hold(shouldHold);
      console.log(`${shouldHold ? '⏸️' : '▶️'} Call ${shouldHold ? 'on hold' : 'resumed'}`);
    } catch (error) {
      console.error('❌ Failed to hold/unhold call:', error);
      throw error;
    }
  }

  async sendDigits(digits: string): Promise<void> {
    try {
      if (!this.activeCall) throw new Error('No active call');
      await this.activeCall.sendDigits(digits);
      console.log(`🔢 Sent digits: ${digits}`);
    } catch (error) {
      console.error('❌ Failed to send digits:', error);
      throw error;
    }
  }

  // ============================================
  // 8. CALL STATE GETTERS
  // ============================================

  getActiveCall(): Call | null {
    return this.activeCall;
  }

  isCallActive(): boolean {
    return this.activeCall !== null;
  }

  getCallState(): string | null {
    return this.activeCall?.getState() ?? null;
  }

  getCallSid(): string | null {
    return this.activeCall?.getSid() ?? null;
  }

  isMuted(): boolean {
    return this.activeCall?.isMuted() ?? false;
  }

  isOnHold(): boolean {
    return this.activeCall?.isOnHold() ?? false;
  }

  getCallFrom(): string | null {
    return this.activeCall?.getFrom() ?? null;
  }

  getCallTo(): string | null {
    return this.activeCall?.getTo() ?? null;
  }

  // ============================================
  // 9. CLEANUP
  // ============================================

  async unregister(): Promise<void> {
    try {
      if (this.activeCall) {
        await this.hangup();
      }

      if (this.voice && this.isInitialized) {
        const token = await this.fetchAccessToken();
        await this.voice.unregister(token);
        this.voice = null;
      }

      this.isInitialized = false;
      console.log('✅ Twilio Voice SDK unregistered');
    } catch (error) {
      console.error('❌ Failed to unregister:', error);
      throw error;
    }
  }

  // ============================================
  // 10. UPDATE EVENT HANDLERS
  // ============================================

  updateEventHandlers(handlers: Partial<CallEventHandlers>): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }
}

// Export singleton instance
export default new TwilioVoiceService();
