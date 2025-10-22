import { EventEmitter } from 'eventemitter3';
import {
  Call,
  CallInvite,
  CallState,
  ConnectOptions,
  TwilioEvent,
  CallConnectedEvent,
  CallDisconnectedEvent,
  CallInviteEvent,
  TwilioError,
  TwilioErrorCode,
  AudioDevice,
} from '@/types/twilio';

class MockTwilioVoiceSDK extends EventEmitter {
  private isRegistered = false;
  private activeCall: Call | null = null;
  private pendingCallInvite: CallInvite | null = null;
  private callIdCounter = 0;
  private audioDevices: AudioDevice[] = [
    { uuid: '1', name: 'Speaker', type: 'speaker' },
    { uuid: '2', name: 'Earpiece', type: 'earpiece' },
  ];
  private selectedAudioDevice: AudioDevice = this.audioDevices[1]; // Earpiece default

  constructor() {
    super();
  }

  // ============================================
  // DEVICE REGISTRATION
  // ============================================

  /**
   * Register device with Twilio
   * In real SDK, this registers for VoIP push notifications
   */
  async register(accessToken: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        if (!accessToken || accessToken.length < 10) {
          const error: TwilioError = {
            code: TwilioErrorCode.INVALID_TOKEN,
            message: 'Invalid access token',
          };
          this.emit('deviceError', { error: error.message });
          reject(error);
          return;
        }

        this.isRegistered = true;
        this.emit('deviceReady', { device: 'mock-device' });
        resolve();
      }, 500);
    });
  }

  /**
   * Unregister device
   */
  async unregister(): Promise<void> {
    this.isRegistered = false;
    this.emit('deviceNotReady');
    return Promise.resolve();
  }

  // ============================================
  // OUTGOING CALLS
  // ============================================

  /**
   * Make an outgoing call
   */
  async connect(options: ConnectOptions): Promise<Call> {
    return new Promise((resolve, reject) => {
      if (!this.isRegistered) {
        reject(new Error('Device not registered'));
        return;
      }

      if (this.activeCall) {
        reject(new Error('Call already in progress'));
        return;
      }

      const callSid = `CA${Date.now()}${this.callIdCounter++}`;
      const to = options.params?.To || '';
      const from = options.params?.From || '+1234567890';

      const call: Call = {
        callSid,
        from,
        to,
        state: 'connecting',
        direction: 'outgoing',
        isMuted: false,
        isOnHold: false,
        customParameters: options.params,
      };

      this.activeCall = call;

      // Emit connecting event
      this.emit('callConnecting', { call });

      // Simulate connection delay
      setTimeout(() => {
        if (this.activeCall?.callSid === callSid) {
          // Update state to connected
          this.activeCall.state = 'connected';

          const event: CallConnectedEvent = { call: this.activeCall };
          this.emit('callConnected', event);

          resolve(this.activeCall);
        }
      }, 2000); // 2 second delay to simulate ringing
    });
  }

  /**
   * Disconnect active call
   */
  async disconnect(): Promise<void> {
    if (!this.activeCall) {
      return Promise.resolve();
    }

    const call = this.activeCall;
    call.state = 'disconnected';

    const event: CallDisconnectedEvent = { call };
    this.emit('callDisconnected', event);

    this.activeCall = null;
    return Promise.resolve();
  }

  // ============================================
  // INCOMING CALLS
  // ============================================

  /**
   * Accept an incoming call
   */
  async acceptCallInvite(callInvite: CallInvite): Promise<Call> {
    return new Promise((resolve) => {
      if (!callInvite) {
        throw new Error('No call invite to accept');
      }

      const call: Call = {
        callSid: callInvite.callSid,
        from: callInvite.from,
        to: callInvite.to,
        state: 'connecting',
        direction: 'incoming',
        isMuted: false,
        isOnHold: false,
        customParameters: callInvite.customParameters,
      };

      this.activeCall = call;
      this.pendingCallInvite = null;

      this.emit('callInviteAccepted', { callInvite });

      // Simulate connection
      setTimeout(() => {
        if (this.activeCall?.callSid === call.callSid) {
          this.activeCall.state = 'connected';
          this.emit('callConnected', { call: this.activeCall });
          resolve(this.activeCall);
        }
      }, 1000);
    });
  }

  /**
   * Reject an incoming call
   */
  async rejectCallInvite(callInvite: CallInvite): Promise<void> {
    this.pendingCallInvite = null;
    this.emit('callInviteCancelled', { callInvite });
    return Promise.resolve();
  }

  // ============================================
  // CALL CONTROLS
  // ============================================

  /**
   * Mute/unmute microphone
   */
  async setMuted(muted: boolean): Promise<void> {
    if (this.activeCall) {
      this.activeCall.isMuted = muted;
    }
    return Promise.resolve();
  }

  /**
   * Get mute status
   */
  isMuted(): boolean {
    return this.activeCall?.isMuted || false;
  }

  /**
   * Put call on hold
   */
  async setOnHold(onHold: boolean): Promise<void> {
    if (this.activeCall) {
      this.activeCall.isOnHold = onHold;
    }
    return Promise.resolve();
  }

  /**
   * Send DTMF digits
   */
  async sendDigits(digits: string): Promise<void> {
    console.log('Sending digits:', digits);
    return Promise.resolve();
  }

  // ============================================
  // AUDIO DEVICE MANAGEMENT
  // ============================================

  /**
   * Get available audio devices
   */
  getAudioDevices(): AudioDevice[] {
    return this.audioDevices;
  }

  /**
   * Get selected audio device
   */
  getSelectedAudioDevice(): AudioDevice {
    return this.selectedAudioDevice;
  }

  /**
   * Select audio device
   */
  async selectAudioDevice(device: AudioDevice): Promise<void> {
    this.selectedAudioDevice = device;
    this.emit('audioDeviceChanged', {
      selectedDevice: device,
      availableDevices: this.audioDevices,
    });
    return Promise.resolve();
  }

  /**
   * Toggle speaker
   */
  async toggleSpeaker(): Promise<void> {
    const currentType = this.selectedAudioDevice.type;
    const newDevice = currentType === 'speaker'
      ? this.audioDevices.find(d => d.type === 'earpiece')!
      : this.audioDevices.find(d => d.type === 'speaker')!;

    await this.selectAudioDevice(newDevice);
  }

  // ============================================
  // GETTERS
  // ============================================

  getActiveCall(): Call | null {
    return this.activeCall;
  }

  getPendingCallInvite(): CallInvite | null {
    return this.pendingCallInvite;
  }

  isDeviceRegistered(): boolean {
    return this.isRegistered;
  }

  // ============================================
  // MOCK HELPERS (for testing)
  // ============================================

  /**
   * Simulate an incoming call (for testing)
   */
  simulateIncomingCall(from: string = '+254712345678'): void {
    if (!this.isRegistered) {
      console.warn('Device not registered');
      return;
    }

    const callInvite: CallInvite = {
      callSid: `CA${Date.now()}${this.callIdCounter++}`,
      from,
      to: '+1234567890',
      customParameters: {
        location: 'Nairobi, Kenya',
      },
    };

    this.pendingCallInvite = callInvite;

    const event: CallInviteEvent = { callInvite };
    this.emit('callInvite', event);
  }

  /**
   * Simulate call disconnection (for testing)
   */
  simulateDisconnect(): void {
    if (this.activeCall) {
      this.disconnect();
    }
  }

  /**
   * Simulate remote party hanging up
   */
  simulateRemoteDisconnect(): void {
    if (this.activeCall) {
      const call = this.activeCall;
      call.state = 'disconnected';

      this.emit('callDisconnected', { call });
      this.activeCall = null;
    }
  }
}

// Export singleton instance
export const twilioVoice = new MockTwilioVoiceSDK();

// Export class for testing
export default MockTwilioVoiceSDK;
