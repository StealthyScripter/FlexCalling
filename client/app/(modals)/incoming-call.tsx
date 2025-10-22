import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { useEffect } from 'react';
import { useCall } from '@/contexts/call-context';

export default function IncomingCallScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  // Get call data from context
  const { callData, acceptCall, rejectCall } = useCall();
  const incomingCall = callData.incomingCallInvite;

  const handleAccept = async () => {
    try {
      // Accept the call
      await acceptCall();

      // Navigate to active call screen
      router.replace('/(modals)/active-call');
    } catch (error) {
      console.error('Failed to accept call:', error);
      router.back();
    }
  };

  const handleDecline = async () => {
    try {
      // Reject the call
      await rejectCall();

      // Go back
      router.back();
    } catch (error) {
      console.error('Failed to reject call:', error);
      router.back();
    }
  };

  // Redirect if no incoming call
  useEffect(() => {
    if (!incomingCall) {
      router.back();
    }
  }, [incomingCall]);

  // Don't render if no incoming call
  if (!incomingCall) {
    return null;
  }

  // Get caller info
  const callerNumber = incomingCall.from;
  const callerInitial = callerNumber[0] || '?';
  const location = incomingCall.customParameters?.location || 'Unknown Location';

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, styles.blur1, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)' }]} />
      <View style={[styles.decorativeBlur, styles.blur2, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)' }]} />

      <View style={styles.callerInfo}>
        <BlurView intensity={isDark ? 30 : 70} tint={colorScheme} style={styles.callerCard}>
          {/* Caller Avatar */}
          <View style={[styles.callerAvatar, { backgroundColor: '#3B82F6' }]}>
            <ThemedText style={styles.callerInitial}>{callerInitial}</ThemedText>
          </View>

          {/* Caller Number */}
          <ThemedText type="title" style={styles.callerName}>
            {callerNumber}
          </ThemedText>

          {/* Location Badge */}
          <View style={styles.locationBadge}>
            <IconSymbol name="mappin.circle.fill" size={16} color="#10B981" />
            <ThemedText style={styles.callerLocation}>
              {location}
            </ThemedText>
          </View>

          {/* Incoming Call Label */}
          <View style={styles.callTypeBadge}>
            <IconSymbol name="phone.arrow.down.left.fill" size={16} color="#3B82F6" />
            <ThemedText style={styles.callType}>Incoming Call</ThemedText>
          </View>

          {/* Call ID for reference */}
          <ThemedText style={styles.callId}>
            Call ID: {incomingCall.callSid.substring(0, 8)}...
          </ThemedText>
        </BlurView>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {/* Decline Button */}
        <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
          <IconSymbol name="phone.down.fill" size={32} color="#fff" />
          <ThemedText style={styles.buttonLabel}>Decline</ThemedText>
        </TouchableOpacity>

        {/* Accept Button */}
        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <IconSymbol name="phone.fill" size={32} color="#fff" />
          <ThemedText style={styles.buttonLabel}>Accept</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 40 },
  decorativeBlur: { position: 'absolute', borderRadius: 200 },
  blur1: { width: 350, height: 350, top: -100, right: -100 },
  blur2: { width: 300, height: 300, bottom: 100, left: -100 },
  callerInfo: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  callerCard: { borderRadius: 32, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  callerAvatar: { width: 120, height: 120, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  callerInitial: { color: '#fff', fontSize: 48, fontWeight: '600' },
  callerName: { marginBottom: 12 },
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, marginBottom: 8 },
  callerLocation: { fontSize: 16, color: '#10B981', fontWeight: '600' },
  callTypeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, marginBottom: 8 },
  callType: { fontSize: 14, color: '#3B82F6', fontWeight: '600' },
  callId: { fontSize: 10, opacity: 0.5, marginTop: 8 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 40 },
  declineButton: { alignItems: 'center', gap: 8 },
  acceptButton: { alignItems: 'center', gap: 8 },
  buttonLabel: { color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 4 },
});
