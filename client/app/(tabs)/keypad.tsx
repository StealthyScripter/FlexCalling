import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { PhoneInput } from '@/components/phone-input';
import { useState } from 'react';
import { useCall } from '@/contexts/call-context';
import { APIService } from '@/services/api.service';

// Config for default country
const DEFAULT_COUNTRY = { name: 'Kenya', code: '+254' };

export default function KeypadScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCalling, setIsCalling] = useState(false);

  const { makeCall, isDeviceReady } = useCall();

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ];

  const handleKeyPress = (key: string) => {
    setPhoneNumber(prev => prev + key);
  };

  const handleDelete = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleMakeCall = async () => {
    if (isCalling) return;

    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    if (!isDeviceReady) {
      Alert.alert('Error', 'Device not ready. Please try again.');
      return;
    }

    setIsCalling(true);

    try {
      // Format number (add Kenya prefix if needed)
      let formattedNumber = phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        formattedNumber = DEFAULT_COUNTRY.code + phoneNumber.replace(/^0/, '');
      }

      // Make the call using SDK
      await makeCall(formattedNumber);

      // Save to mock call logs
      APIService.saveCallLog({
        call: { from: DEFAULT_COUNTRY.code, to: formattedNumber, state: 'connected', isMuted: false, isOnHold: false, direction: 'outgoing', callSid: Date.now().toString() },
        incomingCallInvite: null,
        callStartTime: new Date(),
        callDuration: 0,
        ratePerMinute: 0.15,
        estimatedCost: 0,
      });

      // Navigate to active call screen
      router.push('/(modals)/active-call');
    } catch (error: any) {
      console.error('Failed to make call:', error);
      Alert.alert('Error', error.message || 'Failed to make call');
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, styles.blur1, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]} />

      <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.phoneNumberCard}>
        <View style={styles.locationBadge}>
          <IconSymbol name="globe" size={14} color="#10B981" />
          <ThemedText style={styles.locationText}>{DEFAULT_COUNTRY.name} ({DEFAULT_COUNTRY.code})</ThemedText>
        </View>
        <PhoneInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          onDelete={handleDelete}
        />
      </BlurView>

      <View style={styles.keypadContainer}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyRow}>
            {row.map(key => (
              <BlurView key={key} intensity={isDark ? 15 : 40} tint={colorScheme} style={styles.key}>
                <TouchableOpacity
                  style={styles.keyTouchable}
                  onPress={() => handleKeyPress(key)}
                >
                  <ThemedText type="title" style={styles.keyText}>{key}</ThemedText>
                </TouchableOpacity>
              </BlurView>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <IconSymbol name="delete.left.fill" size={28} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.callButton,
            (!phoneNumber || !isDeviceReady || isCalling) && styles.callButtonDisabled
          ]}
          disabled={!phoneNumber || !isDeviceReady || isCalling}
          onPress={handleMakeCall}
        >
          <IconSymbol name="phone.fill" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.spacer} />
      </View>

      {!isDeviceReady && (
        <View style={styles.statusBanner}>
          <ThemedText style={styles.statusText}>
            Connecting to network...
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  decorativeBlur: { position: 'absolute', width: 300, height: 300, borderRadius: 200, top: -120, left: -100, opacity: 0.6 },
  blur1: {},
  phoneNumberCard: { marginTop: 60, marginHorizontal: 20, borderRadius: 24, padding: 5, alignItems: 'center', marginBottom: 5, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 12 },
  locationText: { fontSize: 14, color: '#10B981', fontWeight: '600' },
  keypadContainer: { gap: 5, paddingHorizontal: 20 },
  keyRow: { flexDirection: 'row', justifyContent: 'space-around', gap: 16 },
  key: { flex: 1, aspectRatio: 1, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  keyTouchable: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  keyText: { fontSize: 28 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 },
  callButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  callButtonDisabled: { backgroundColor: '#9CA3AF', shadowOpacity: 0 },
  deleteButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  spacer: { width: 56 },
  statusBanner: { position: 'absolute', bottom: 100, left: 20, right: 20, backgroundColor: 'rgba(245, 158, 11, 0.9)', padding: 12, borderRadius: 12 },
  statusText: { textAlign: 'center', color: '#fff', fontWeight: '600' },
});
