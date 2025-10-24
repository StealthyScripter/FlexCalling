import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { twilioVoice } from '@/services/mock-twilio.service';
import {
  CallUIData,
  ConnectOptions,
  AudioDevice,
  CallConnectedEvent,
} from '@/types/twilio';

interface CallContextType {
  // State
  callData: CallUIData;
  isDeviceReady: boolean;
  audioDevice: AudioDevice | null;
  availableAudioDevices: AudioDevice[];

  // Actions
  makeCall: (to: string, from?: string) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => Promise<void>;
  toggleSpeaker: () => Promise<void>;
  sendDigits: (digits: string) => Promise<void>;

  // Device
  registerDevice: (token: string) => Promise<void>;
  unregisterDevice: () => Promise<void>;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export function CallProvider({ children }: { children: ReactNode }) {
  const [isDeviceReady, setIsDeviceReady] = useState(false);
  const [callData, setCallData] = useState<CallUIData>({
    call: null,
    incomingCallInvite: null,
    callStartTime: null,
    callDuration: 0,
    ratePerMinute: 0.15, // Default rate for Kenya
    estimatedCost: 0,
  });
  const [audioDevice, setAudioDevice] = useState<AudioDevice | null>(null);
  const [availableAudioDevices, setAvailableAudioDevices] = useState<AudioDevice[]>([]);

  const [durationInterval, setDurationInterval] = useState<number | null>(null);

  // ============================================
  // SETUP EFFECT - Register event listeners
  // ============================================
  useEffect(() => {
    // Device events
    const handleDeviceReady = () => {
      console.log('Device ready');
      setIsDeviceReady(true);

      // Get audio devices
      const devices = twilioVoice.getAudioDevices();
      setAvailableAudioDevices(devices);
      setAudioDevice(twilioVoice.getSelectedAudioDevice());
    };

    const handleDeviceNotReady = () => {
      console.log('Device not ready');
      setIsDeviceReady(false);
    };

    const handleDeviceError = (event: any) => {
      console.error('Device error:', event.error);
      setIsDeviceReady(false);
    };

    // Call events
    const handleCallInvite = (event: any) => {
      console.log('Call invite received:', event.callInvite);
      setCallData(prev => ({
        ...prev,
        incomingCallInvite: event.callInvite,
      }));
    };

    const handleCallConnecting = (event: any) => {
      console.log('Call connecting:', event.call);
      setCallData(prev => ({
        ...prev,
        call: event.call,
      }));
    };

    const handleCallConnected = (event: CallConnectedEvent) => {
      console.log('Call connected:', event.call);
      const startTime = new Date();

      setCallData(prev => ({
        ...prev,
        call: event.call,
        callStartTime: startTime,
        callDuration: 0,
        estimatedCost: 0,
      }));

      // Start duration timer
      const interval = setInterval(() => {
        setCallData(prev => {
          if (!prev.callStartTime) return prev;

          const duration = Math.floor((Date.now() - prev.callStartTime.getTime()) / 1000);
          const cost = (duration / 60) * prev.ratePerMinute;

          return {
            ...prev,
            callDuration: duration,
            estimatedCost: cost,
          };
        });
      }, 1000) as unknown as number;

      setDurationInterval(interval);
    };

    const handleCallDisconnected = (event: any) => {
      console.log('Call disconnected:', event.call);

      // Clear duration timer
      if (durationInterval) {
        clearInterval(durationInterval);
        setDurationInterval(null);
      }

      // Save to call history here if needed

      setCallData(prev => ({
        ...prev,
        call: null,
        callStartTime: null,
        callDuration: 0,
        estimatedCost: 0,
      }));
    };

    const handleCallInviteCancelled = (event: any) => {
      console.log('Call invite cancelled:', event.callInvite);
      setCallData(prev => ({
        ...prev,
        incomingCallInvite: null,
      }));
    };

    const handleAudioDeviceChanged = (event: any) => {
      console.log('Audio device changed:', event.selectedDevice);
      setAudioDevice(event.selectedDevice);
      setAvailableAudioDevices(event.availableDevices);
    };

    // Register listeners
    twilioVoice.on('deviceReady', handleDeviceReady);
    twilioVoice.on('deviceNotReady', handleDeviceNotReady);
    twilioVoice.on('deviceError', handleDeviceError);
    twilioVoice.on('callInvite', handleCallInvite);
    twilioVoice.on('callConnecting', handleCallConnecting);
    twilioVoice.on('callConnected', handleCallConnected);
    twilioVoice.on('callDisconnected', handleCallDisconnected);
    twilioVoice.on('callInviteCancelled', handleCallInviteCancelled);
    twilioVoice.on('audioDeviceChanged', handleAudioDeviceChanged);

    // Cleanup
    return () => {
      twilioVoice.removeListener('deviceReady', handleDeviceReady);
      twilioVoice.removeListener('deviceNotReady', handleDeviceNotReady);
      twilioVoice.removeListener('deviceError', handleDeviceError);
      twilioVoice.removeListener('callInvite', handleCallInvite);
      twilioVoice.removeListener('callConnecting', handleCallConnecting);
      twilioVoice.removeListener('callConnected', handleCallConnected);
      twilioVoice.removeListener('callDisconnected', handleCallDisconnected);
      twilioVoice.removeListener('callInviteCancelled', handleCallInviteCancelled);
      twilioVoice.removeListener('audioDeviceChanged', handleAudioDeviceChanged);

      if (durationInterval) {
        clearInterval(durationInterval);
      }
    };
  }, [durationInterval]);

  // ============================================
  // ACTIONS
  // ============================================

  const registerDevice = async (token: string) => {
    await twilioVoice.register(token);
  };

  const unregisterDevice = async () => {
    await twilioVoice.unregister();
  };

  const makeCall = async (to: string, from?: string) => {
    const options: ConnectOptions = {
      accessToken: 'mock-token', // In real app, get from backend
      params: {
        To: to,
        From: from || '+1234567890',
      },
    };

    await twilioVoice.connect(options);
  };

  const acceptCall = async () => {
    if (!callData.incomingCallInvite) {
      throw new Error('No incoming call to accept');
    }

    await twilioVoice.acceptCallInvite(callData.incomingCallInvite);

    setCallData(prev => ({
      ...prev,
      incomingCallInvite: null,
    }));
  };

  const rejectCall = async () => {
    if (!callData.incomingCallInvite) {
      throw new Error('No incoming call to reject');
    }

    await twilioVoice.rejectCallInvite(callData.incomingCallInvite);

    setCallData(prev => ({
      ...prev,
      incomingCallInvite: null,
    }));
  };

  const endCall = async () => {
    await twilioVoice.disconnect();
  };

  const toggleMute = async () => {
    const currentCall = twilioVoice.getActiveCall();
    if (currentCall) {
      const newMutedState = !currentCall.isMuted;
      await twilioVoice.setMuted(newMutedState);

      // Update local state
      setCallData(prev => ({
        ...prev,
        call: prev.call ? { ...prev.call, isMuted: newMutedState } : null,
      }));
    }
  };

  const toggleSpeaker = async () => {
    await twilioVoice.toggleSpeaker();
  };

  const sendDigits = async (digits: string) => {
    await twilioVoice.sendDigits(digits);
  };

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value: CallContextType = {
    callData,
    isDeviceReady,
    audioDevice,
    availableAudioDevices,
    makeCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleSpeaker,
    sendDigits,
    registerDevice,
    unregisterDevice,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}

// ============================================
// HOOK
// ============================================
export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within CallProvider');
  }
  return context;
}
