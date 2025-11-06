import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { useEffect, useState } from 'react';
import { useCall } from '@/contexts/call-context';
import { APIService } from '@/services/api.services';
import { getFirstInitial } from '@/utils';

export default function IncomingCallScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const { callData, acceptCall, rejectCall } = useCall();
  const incomingCall = callData.incomingCallInvite;

  const [contactInfo, setContactInfo] = useState<{
    name: string;
    avatar: string;
    initial: string;
  } | null>(null);

  // Load contact information
  useEffect(() => {
    if (incomingCall) {
      const callerNumber = incomingCall.from;
      const contact = APIService.getContactByPhone(callerNumber);

      if (contact) {
        setContactInfo({
          name: contact.name,
          avatar: contact.avatarColor,
          initial: getFirstInitial(contact.name)
        });
      } else {
        setContactInfo({
          name: callerNumber,
          avatar: '#3B82F6',
          initial: getFirstInitial(callerNumber)
        });
      }
    }
  }, [incomingCall]);

  const handleAccept = async () => {
    try {
      console.log('Accepting call...');

      if (!incomingCall) {
        Alert.alert('Error', 'No incoming call to accept');
        router.back();
        return;
      }

      await acceptCall();
      router.replace('/(modals)/active-call');
    } catch (error) {
      console.error('Failed to accept call:', error);
      Alert.alert('Error', 'Failed to accept call');

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    }
  };

  const handleDecline = async () => {
    try {
      console.log('Declining call...');

      if (!incomingCall) {
        console.log('No incoming call to decline');
        router.back();
        return;
      }

      await rejectCall();

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Failed to reject call:', error);

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    }
  };

  useEffect(() => {
    console.log('Incoming call screen mounted. Invite:', incomingCall);

    if (!incomingCall) {
      console.log('No incoming call invite found');

      const timeout = setTimeout(() => {
        if (!incomingCall) {
          Alert.alert('No Incoming Call', 'There is no incoming call to display', [
            {
              text: 'OK',
              onPress: () => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(tabs)');
                }
              }
            }
          ]);
        }
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [incomingCall, router]);

  if (!incomingCall || !contactInfo) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.decorativeBlur, styles.blur1, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)' }]} />

        <View style={styles.callerInfo}>
          <BlurView intensity={isDark ? 30 : 70} tint={colorScheme} style={styles.callerCard}>
            <ThemedText style={{ opacity: 0.6 }}>Loading incoming call...</ThemedText>
          </BlurView>
        </View>
      </ThemedView>
    );
  }

  const location = incomingCall.customParameters?.location || 'Unknown Location';
  const callId = incomingCall.callSid;

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, styles.blur1, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)' }]} />
      <View style={[styles.decorativeBlur, styles.blur2, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)' }]} />

      <View style={styles.callerInfo}>
        <BlurView intensity={isDark ? 30 : 70} tint={colorScheme} style={styles.callerCard}>
          <View style={[styles.callerAvatar, { backgroundColor: contactInfo.avatar }]}>
            <ThemedText style={styles.callerInitial}>{contactInfo.initial}</ThemedText>
          </View>

          <ThemedText type="title" style={styles.callerName}>{contactInfo.name}</ThemedText>

          <View style={styles.locationBadge}>
            <IconSymbol name="mappin.circle.fill" size={16} color="#10B981" />
            <ThemedText style={styles.callerLocation}>{location}</ThemedText>
          </View>

          <View style={styles.callTypeBadge}>
            <IconSymbol name="phone.arrow.down.left.fill" size={16} color="#3B82F6" />
            <ThemedText style={styles.callType}>Incoming Call</ThemedText>
          </View>

          <ThemedText style={styles.callId}>Call ID: {callId.substring(0, 8)}...</ThemedText>
        </BlurView>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.declineButtonContainer} onPress={handleDecline}>
          <View style={[styles.buttonCircle, styles.declineCircle]}>
            <IconSymbol name="phone.down.fill" size={32} color="#fff" />
          </View>
          <ThemedText style={styles.buttonLabel}>Decline</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.acceptButtonContainer} onPress={handleAccept}>
          <View style={[styles.buttonCircle, styles.acceptCircle]}>
            <IconSymbol name="phone.fill" size={32} color="#fff" />
          </View>
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
  declineButtonContainer: { alignItems: 'center', gap: 12 },
  acceptButtonContainer: { alignItems: 'center', gap: 12 },
  buttonCircle: { width: 75, height: 75, borderRadius: 38, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  declineCircle: { backgroundColor: '#EF4444', shadowColor: '#EF4444' },
  acceptCircle: { backgroundColor: '#10B981', shadowColor: '#10B981' },
  buttonLabel: { fontSize: 14, fontWeight: '600' },
});
