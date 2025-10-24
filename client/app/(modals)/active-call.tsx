import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { useEffect, useRef, useCallback } from 'react';
import { useCall } from '@/contexts/call-context';
import { APIService } from '@/services/api.service';
import { CallUIData } from '@/types/twilio';

export default function ActiveCallScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const { callData, endCall, toggleMute, toggleSpeaker, audioDevice } = useCall();

  // ADDED: Track if call log has been saved to prevent duplicates
  const callLogSavedRef = useRef(false);

  const call = callData.call;
  const duration = callData.callDuration;
  const cost = callData.estimatedCost;

  const isMuted = call?.isMuted || false;
  const isSpeaker = audioDevice?.type === 'speaker';

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
  };

  // Save call log only once
  const saveCallLog = useCallback(() => {
    if (!call || callLogSavedRef.current) {
      console.log('Call log already saved or no call data');
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
    callLogSavedRef.current = true; // Mark as saved
    console.log('Call log saved (once):', uiData);
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
              // Save call log before ending
              saveCallLog();

              // End the call
              await endCall();

              // Navigate back
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)');
              }
            } catch (error) {
              console.error('Failed to end call:', error);

              // Still save the log even if end call fails
              saveCallLog();

              // Navigate back
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

  useEffect(() => {
    // Reset the saved flag when a new call starts
    if (call) {
      callLogSavedRef.current = false;
    }

    // If call ends unexpectedly, save and navigate
    if (!call && callData.callStartTime) {
      saveCallLog();

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [call, callData.callStartTime, router, saveCallLog]);

  // ADDED: Cleanup on unmount - save call log if not already saved
  useEffect(() => {
    return () => {
      if (call && !callLogSavedRef.current) {
        console.log('Component unmounting, saving call log');
        saveCallLog();
      }
    };
  }, [call, saveCallLog]);

  if (!call) return null;

  const displayName = call.to;
  const displayInitial = displayName[0] || '?';

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, styles.blur1, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)' }]} />

      <View style={styles.callerInfo}>
        <BlurView intensity={isDark ? 30 : 70} tint={colorScheme} style={styles.callerCard}>
          <View style={[styles.callerAvatar, { backgroundColor: '#8B5CF6' }]}>
            <ThemedText style={styles.callerInitial}>{displayInitial}</ThemedText>
          </View>
          <ThemedText type="title" style={styles.callerName}>{displayName}</ThemedText>

          <View style={styles.durationBadge}>
            <View style={styles.pulseDot} />
            <ThemedText style={styles.callDuration}>{formatDuration(duration)}</ThemedText>
          </View>

          <View style={styles.rateBadge}>
            <IconSymbol name="dollarsign.circle.fill" size={16} color="#10B981" />
            <ThemedText style={styles.callRate}>${cost.toFixed(2)} • ${callData.ratePerMinute}/min</ThemedText>
          </View>

          <View style={styles.stateBadge}>
            <ThemedText style={styles.stateText}>
              {call.state === 'connecting' ? 'Connecting...' :
               call.state === 'ringing' ? 'Ringing...' : 'Connected'}
            </ThemedText>
          </View>
        </BlurView>
      </View>

      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <TouchableOpacity style={[styles.controlButton, isMuted && styles.controlButtonActive]} onPress={handleToggleMute}>
            <IconSymbol name={isMuted ? "mic.slash.fill" : "mic.fill"} size={24} color="#fff" />
            <ThemedText style={styles.controlLabel}>Mute</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.controlButton, isSpeaker && styles.controlButtonActive]} onPress={handleToggleSpeaker}>
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
  callerCard: { borderRadius: 32, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  callerAvatar: { width: 120, height: 120, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  callerInitial: { color: '#fff', fontSize: 48, fontWeight: '600' },
  callerName: { marginBottom: 16 },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginBottom: 12 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  callDuration: { fontSize: 20, fontWeight: '600', color: '#10B981' },
  rateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, marginBottom: 8 },
  callRate: { fontSize: 14, opacity: 0.8 },
  stateBadge: { backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  stateText: { fontSize: 12, color: '#3B82F6', fontWeight: '600' },
  controls: { alignItems: 'center', gap: 32, marginBottom: 40 },
  controlRow: { flexDirection: 'row', gap: 32 },
  controlButton: { width: 75, height: 75, borderRadius: 38, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', gap: 4 },
  controlButtonActive: { backgroundColor: '#10B981' },
  controlLabel: { fontSize: 11, marginTop: 4, color: '#fff', fontWeight: '600' },
  endCallButton: { width: 75, height: 75, borderRadius: 38, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
});
