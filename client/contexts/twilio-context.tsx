import React, { createContext, useContext, ReactNode } from 'react';
import { useTwilioVoice } from '@/hooks/use-twilio-voice';

// ✅ Updated with your ngrok URL
const BACKEND_URL = __DEV__
  ? 'https://13b8f05aab71.ngrok-free.app'
  : 'https://your-production-backend.com';

type TwilioContextType = ReturnType<typeof useTwilioVoice>;

const TwilioContext = createContext<TwilioContextType | undefined>(undefined);

export function TwilioProvider({ children }: { children: ReactNode }) {
  const twilioState = useTwilioVoice({
    backendUrl: BACKEND_URL,
    userId: 'user-123',
  });

  return (
    <TwilioContext.Provider value={twilioState}>
      {children}
    </TwilioContext.Provider>
  );
}

export function useTwilioContext() {
  const context = useContext(TwilioContext);
  if (!context) {
    throw new Error('useTwilioContext must be used within TwilioProvider');
  }
  return context;
}
