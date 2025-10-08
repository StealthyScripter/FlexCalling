import { useState, useEffect, useCallback, useRef } from 'react';
import { Call, CallInvite } from '@twilio/voice-react-native-sdk';
import TwilioVoiceService, { TwilioConfig } from '@/services/twilio-voice.service';

export interface CallState {
  isActive: boolean;
  isMuted: boolean;
  isSpeakerOn: boolean;
  isOnHold: boolean;
  callSid: string | null;
  callState: string | null;
  duration: number; // in seconds
  from: string | null;
  to: string | null;
}

export interface IncomingCallState {
  callInvite: CallInvite | null;
  from: string | null;
  callerName: string | null;
}

export function useTwilioVoice(config: TwilioConfig) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use ref to track if component is mounted
  const isMounted = useRef(true);

  // Call state
  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    isMuted: false,
    isSpeakerOn: false,
    isOnHold: false,
    callSid: null,
    callState: null,
    duration: 0,
    from: null,
    to: null,
  });

  // Incoming call state
  const [incomingCall, setIncomingCall] = useState<IncomingCallState>({
    callInvite: null,
    from: null,
    callerName: null,
  });

  // Duration timer
  const [startTime, setStartTime] = useState<number | null>(null);

  // ============================================
  // UPDATE CALL STATE - Memoized with useCallback
  // ============================================
  const updateCallState = useCallback(() => {
    const activeCall = TwilioVoiceService.getActiveCall();

    if (!activeCall) {
      setCallState({
        isActive: false,
        isMuted: false,
        isSpeakerOn: false,
        isOnHold: false,
        callSid: null,
        callState: null,
        duration: 0,
        from: null,
        to: null,
      });
      return;
    }

    setCallState((prev) => ({
      isActive: true,
      isMuted: TwilioVoiceService.isMuted(),
      isSpeakerOn: prev.isSpeakerOn, // Keep previous value as SDK doesn't expose this
      isOnHold: TwilioVoiceService.isOnHold(),
      callSid: TwilioVoiceService.getCallSid(),
      callState: TwilioVoiceService.getCallState(),
      duration: prev.duration,
      from: TwilioVoiceService.getCallFrom(),
      to: TwilioVoiceService.getCallTo(),
    }));
  }, []);

  // ============================================
  // INITIALIZE - Fixed dependency array
  // ============================================
  useEffect(() => {
    const initializeTwilio = async () => {
      if (isInitialized || isInitializing) return;

      setIsInitializing(true);
      setError(null);

      try {
        await TwilioVoiceService.initialize(config, {
          onCallConnected: (call: Call) => {
            if (!isMounted.current) return;
            console.log('Call connected in hook');
            setStartTime(Date.now());
            updateCallState();
          },

          onCallDisconnected: (call: Call, error?: any) => {
            if (!isMounted.current) return;
            console.log('Call disconnected in hook');
            setStartTime(null);
            setCallState({
              isActive: false,
              isMuted: false,
              isSpeakerOn: false,
              isOnHold: false,
              callSid: null,
              callState: null,
              duration: 0,
              from: null,
              to: null,
            });

            if (error) {
              setError(new Error(`Call ended with error: ${error}`));
            }
          },

          onCallRinging: (call: Call) => {
            if (!isMounted.current) return;
            console.log('Call ringing in hook');
            updateCallState();
          },

          onIncomingCall: (callInvite: CallInvite) => {
            if (!isMounted.current) return;
            console.log('Incoming call in hook');
            setIncomingCall({
              callInvite,
              from: callInvite.getFrom(),
              callerName: callInvite.getCustomParameters()?.callerName || null,
            });
          },

          onCallQualityWarning: (call: Call, warnings: any) => {
            console.warn('Call quality warning:', warnings);
          },
        });

        if (isMounted.current) {
          setIsInitialized(true);
        }
      } catch (err) {
        if (isMounted.current) {
          setError(err as Error);
        }
      } finally {
        if (isMounted.current) {
          setIsInitializing(false);
        }
      }
    };

    initializeTwilio();

    return () => {
      isMounted.current = false;
    };
    // Adding updateCallState to dependencies as required by eslint
  }, [config, isInitialized, isInitializing, updateCallState]);

  // ============================================
  // DURATION TIMER
  // ============================================
  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setCallState((prev) => ({ ...prev, duration: elapsed }));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // ============================================
  // CALL ACTIONS
  // ============================================
  const makeCall = useCallback(async (to: string, customParams?: Record<string, string>) => {
    try {
      setError(null);
      await TwilioVoiceService.makeCall(to, customParams);
      updateCallState();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [updateCallState]);

  const hangup = useCallback(async () => {
    try {
      setError(null);
      await TwilioVoiceService.hangup();
      setStartTime(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const toggleMute = useCallback(async () => {
    try {
      setError(null);
      const newMuteState = await TwilioVoiceService.toggleMute();
      setCallState((prev) => ({ ...prev, isMuted: newMuteState }));
      return newMuteState;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const toggleSpeaker = useCallback(async () => {
    try {
      setError(null);
      // Note: Speaker control is not available in the SDK
      // This is a placeholder that updates local state only
      const newSpeakerState = !callState.isSpeakerOn;
      setCallState((prev) => ({ ...prev, isSpeakerOn: newSpeakerState }));

      console.warn('⚠️ Speaker control not implemented - requires audio routing library like react-native-callkeep');

      return newSpeakerState;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [callState.isSpeakerOn]);

  const toggleHold = useCallback(async () => {
    try {
      setError(null);
      const newHoldState = !callState.isOnHold;

      // Call the hold method with the new state
      await TwilioVoiceService.hold(newHoldState);

      setCallState((prev) => ({ ...prev, isOnHold: newHoldState }));
      return newHoldState;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [callState.isOnHold]);

  const sendDigits = useCallback(async (digits: string) => {
    try {
      setError(null);
      await TwilioVoiceService.sendDigits(digits);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  // ============================================
  // INCOMING CALL ACTIONS
  // ============================================
  const acceptIncomingCall = useCallback(async () => {
    try {
      if (!incomingCall.callInvite) {
        throw new Error('No incoming call to accept');
      }

      setError(null);
      await TwilioVoiceService.acceptIncomingCall(incomingCall.callInvite);
      setIncomingCall({ callInvite: null, from: null, callerName: null });
      setStartTime(Date.now());
      updateCallState();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [incomingCall.callInvite, updateCallState]);

  const rejectIncomingCall = useCallback(async () => {
    try {
      if (!incomingCall.callInvite) {
        throw new Error('No incoming call to reject');
      }

      setError(null);
      await TwilioVoiceService.rejectIncomingCall(incomingCall.callInvite);
      setIncomingCall({ callInvite: null, from: null, callerName: null });
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [incomingCall.callInvite]);

  // ============================================
  // FORMAT DURATION
  // ============================================
  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // ============================================
  // CLEANUP ON UNMOUNT
  // ============================================
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ============================================
  // RETURN
  // ============================================
  return {
    // State
    isInitialized,
    isInitializing,
    error,
    callState,
    incomingCall,

    // Actions
    makeCall,
    hangup,
    toggleMute,
    toggleSpeaker,
    toggleHold,
    sendDigits,
    acceptIncomingCall,
    rejectIncomingCall,

    // Utilities
    formatDuration,
    updateCallState,
  };
}
