import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { useTwilioContext } from '@/contexts/twilio-context';
import { useEffect } from 'react';

export default function ActiveCallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const {
    callState,
    hangup,
    toggleMute,
    toggleSpeaker,
    formatDuration,
  } = useTwilioContext();

  // Get call information from params or callState
  const phoneNumber = (params.to as string) || callState.to || 'Unknown';
  const callerName = (params.callerName as string) || 'Unknown';
  const from = (params.from as string) || callState.from || '';

  // Get initials for avatar
  const getInitials = () => {
    if (callerName && callerName !== 'Unknown') {
      return callerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return phoneNumber[0] || '?';
  };

  const handleEndCall = () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end this call?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'End Call',
          style: 'destructive',
          onPress: async () => {
            try {
              await hangup();
              router.back();
            } catch (error) {
              console.error('Hangup error:', error);
              router.back();
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
      Alert.alert('Error', 'Failed to toggle mute');
    }
  };

  const handleToggleSpeaker = async () => {
    try {
      await toggleSpeaker();
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle speaker');
    }
  };

  // Auto-close if call ends
  useEffect(() => {
    if (!callState.isActive && callState.callState === null) {
      router.back();
    }
  }, [callState.isActive, callState.callState]);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, styles.blur1, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)' }]} />

      <View style={styles.callerInfo}>
        <BlurView intensity={isDark ? 30 : 70} tint={colorScheme} style={styles.callerCard}>
          <View style={[styles.callerAvatar, { backgroundColor: '#8B5CF6' }]}>
            <ThemedText style={styles.callerInitial}>{getInitials()}</ThemedText>
          </View>
          <ThemedText type="title" style={styles.callerName}>
            {callerName !== 'Unknown' ? callerName : phoneNumber}
          </ThemedText>
          <View style={styles.durationBadge}>
            <View style={styles.pulseDot} />
            <ThemedText style={styles.callDuration}>{formatDuration(callState.duration)}</ThemedText>
          </View>
          <View style={styles.rateBadge}>
            <IconSymbol name="dollarsign.circle.fill" size={16} color="#10B981" />
            <ThemedText style={styles.callRate}>$0.05/min to Kenya</ThemedText>
          </View>
        </BlurView>
      </View>

      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.controlButton, callState.isMuted && styles.controlButtonActive]}
            onPress={handleToggleMute}
          >
            <IconSymbol name={callState.isMuted ? "mic.slash.fill" : "mic.fill"} size={24} color="#fff" />
            <ThemedText style={styles.controlLabel}>Mute</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, callState.isSpeakerOn && styles.controlButtonActive]}
            onPress={handleToggleSpeaker}
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
  callerCard: { borderRadius: 32, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  callerAvatar: { width: 120, height: 120, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  callerInitial: { color: '#fff', fontSize: 48, fontWeight: '600' },
  callerName: { marginBottom: 16 },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginBottom: 12 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  callDuration: { fontSize: 20, fontWeight: '600', color: '#10B981' },
  rateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12 },
  callRate: { fontSize: 14, opacity: 0.8 },
  controls: { alignItems: 'center', gap: 32, marginBottom: 40 },
  controlRow: { flexDirection: 'row', gap: 32 },
  controlButton: { width: 75, height: 75, borderRadius: 38, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', gap: 4 },
  controlButtonActive: { backgroundColor: '#10B981' },
  controlLabel: { fontSize: 11, marginTop: 4, color: '#fff', fontWeight: '600' },
  endCallButton: { width: 75, height: 75, borderRadius: 38, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
});
