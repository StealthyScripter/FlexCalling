import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { useEffect, useRef, useCallback, useState } from 'react';
import { useCall } from '@/contexts/call-context';
import { APIService } from '@/services/api.service';

// Import types and helpers
import type { CallUIData } from '@/types';
import {
  formatDuration,
  getCallStateInfo,
  formatCurrency,
  getFirstInitial,
} from '@/utils';

interface ContactInfo {
  name: string;
  avatar: string;
  initial: string;
}

export default function ActiveCallScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const { callData, endCall, toggleMute, toggleSpeaker, audioDevice } = useCall();

  const callLogSavedRef = useRef(false);
  const isEndingCallRef = useRef(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

  const call = callData.call;
  const duration = callData.callDuration;
  const cost = callData.estimatedCost;

  const isMuted = call?.isMuted || false;
  const isSpeaker = audioDevice?.type === 'speaker';

  // Get call state info using helper
  const stateInfo = call ? getCallStateInfo(call.state) : { text: 'Initializing...', color: '#6B7280', showDuration: false };

  // Save call log
  const saveCallLog = useCallback(() => {
    if (!call || callLogSavedRef.current) {
      console.log('⏭️ Skipping save - already saved or no call data');
      return;
    }

    const uiData: CallUIData = {
      call,
      incomingCallInvite: null,
      callStartTime: callData.callStartTime ?? new Date(Date.now() - duration * 1000),
      callDuration: duration,
      ratePerMinute: callData.ratePerMinute ?? 0,
      estimatedCost: cost ?? 0,
    };

    APIService.saveCallLog(uiData);
    callLogSavedRef.current = true;
    console.log('📞 Call log saved - Duration: ' + duration + 's, Cost: ' + formatCurrency(cost));
  }, [call, callData.callStartTime, duration, callData.ratePerMinute, cost]);

  const handleEndCall = () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end this call?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Call',
          style: 'destructive',
          onPress: async () => {
            try {
              isEndingCallRef.current = true;

              if (call && !callLogSavedRef.current) {
                console.log('💾 Saving call log on user end call');
                saveCallLog();
              }

              await endCall();

              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)');
              }
            } catch (error) {
              console.error('Failed to end call:', error);

              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)');
              }
            }
          }
        }
      ]
    );
  };

  const handleToggleMute = async () => {
    try {
      await toggleMute();
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  };

  const handleToggleSpeaker = async () => {
    try {
      await toggleSpeaker();
    } catch (error) {
      console.error('Failed to toggle speaker:', error);
    }
  };

  // Load contact information using helper
  useEffect(() => {
    if (!call) return;

    const phoneToLookup = call.direction === 'outgoing' ? call.to : call.from;
    const contact = APIService.getContactByPhone(phoneToLookup);

    if (contact) {
      setContactInfo({
        name: contact.name,
        avatar: contact.avatarColor,
        initial: getFirstInitial(contact.name)
      });
    } else {
      setContactInfo({
        name: phoneToLookup,
        avatar: '#8B5CF6',
        initial: getFirstInitial(phoneToLookup)
      });
    }
  }, [call?.to, call?.from, call?.direction, call]);

  // Reset saved flag when a new call starts
  useEffect(() => {
    if (call && (call.state === 'connecting' || call.state === 'ringing')) {
      console.log('🆕 New call detected, resetting saved flag');
      callLogSavedRef.current = false;
      isEndingCallRef.current = false;
    }
  }, [call?.callSid, call?.state, call]);

  // Handle call disconnection
  useEffect(() => {
    if (call && call.state === 'disconnected') {
      if (!callLogSavedRef.current && !isEndingCallRef.current) {
        console.log('⚠️ Call disconnected unexpectedly, saving log');
        saveCallLog();
      }

      const timeout = setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)');
        }
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [call?.state, call, router, saveCallLog]);

  // Navigate back if no call data
  useEffect(() => {
    if (!call) {
      console.log('❌ No call data, navigating back');
      const timeout = setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)');
        }
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [call, router]);

  if (!call || !contactInfo) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, styles.blur1, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)' }]} />

      <View style={styles.callerInfo}>
        <BlurView intensity={isDark ? 30 : 70} tint={colorScheme} style={styles.callerCard}>
          <View style={[styles.callerAvatar, { backgroundColor: contactInfo.avatar }]}>
            <ThemedText style={styles.callerInitial}>{contactInfo.initial}</ThemedText>
          </View>

          <ThemedText type="title" style={styles.callerName}>{contactInfo.name}</ThemedText>

          {stateInfo.showDuration ? (
            <>
              <View style={styles.durationBadge}>
                <View style={styles.pulseDot} />
                <ThemedText style={styles.callDuration}>{formatDuration(duration)}</ThemedText>
              </View>

              <View style={styles.rateBadge}>
                <IconSymbol name="dollarsign.circle.fill" size={16} color="#10B981" />
                <ThemedText style={styles.callRate}>
                  {formatCurrency(cost)} • {formatCurrency(callData.ratePerMinute)}/min
                </ThemedText>
              </View>
            </>
          ) : (
            <View style={[styles.stateBadge, { backgroundColor: stateInfo.color + '20' }]}>
              <ThemedText style={[styles.stateText, { color: stateInfo.color }]}>
                {stateInfo.text}
              </ThemedText>
            </View>
          )}

          <View style={styles.directionBadge}>
            <IconSymbol
              name={call.direction === 'outgoing' ? 'phone.arrow.up.right.fill' : 'phone.arrow.down.left.fill'}
              size={14}
              color={isDark ? '#94A3B8' : '#6B7280'}
            />
            <ThemedText style={styles.directionText}>
              {call.direction === 'outgoing' ? 'Outgoing' : 'Incoming'}
            </ThemedText>
          </View>
        </BlurView>
      </View>

      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={handleToggleMute}
            disabled={call.state !== 'connected'}
          >
            <IconSymbol name={isMuted ? "mic.slash.fill" : "mic.fill"} size={24} color="#fff" />
            <ThemedText style={styles.controlLabel}>Mute</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, isSpeaker && styles.controlButtonActive]}
            onPress={handleToggleSpeaker}
            disabled={call.state !== 'connected'}
          >
            <IconSymbol name="speaker.wave.3.fill" size={24} color="#fff" />
            <ThemedText style={styles.controlLabel}>Speaker</ThemedText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
          <IconSymbol name="phone.down.fill" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 40 },
  decorativeBlur: { position: 'absolute', width: 320, height: 320, borderRadius: 200, top: -120, left: -100 },
  blur1: {},
  callerInfo: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  callerCard: { borderRadius: 32, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden', minHeight: 320 },
  callerAvatar: { width: 120, height: 120, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  callerInitial: { color: '#fff', fontSize: 48, fontWeight: '600' },
  callerName: { marginBottom: 16, textAlign: 'center' },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginBottom: 12 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  callDuration: { fontSize: 20, fontWeight: '600', color: '#10B981' },
  rateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, marginBottom: 8 },
  callRate: { fontSize: 14, opacity: 0.8 },
  stateBadge: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 16, marginBottom: 12 },
  stateText: { fontSize: 16, fontWeight: '700' },
  directionBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginTop: 4 },
  directionText: { fontSize: 12, opacity: 0.6, fontWeight: '600' },
  controls: { alignItems: 'center', gap: 32, marginBottom: 40 },
  controlRow: { flexDirection: 'row', gap: 32 },
  controlButton: { width: 75, height: 75, borderRadius: 38, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', gap: 4 },
  controlButtonActive: { backgroundColor: '#10B981' },
  controlLabel: { fontSize: 11, marginTop: 4, color: '#fff', fontWeight: '600' },
  endCallButton: { width: 75, height: 75, borderRadius: 38, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
});
