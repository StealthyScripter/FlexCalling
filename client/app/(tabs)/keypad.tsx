import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { PhoneInput } from '@/components/phone-input';
import { useState } from 'react';

export default function KeypadScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const [phoneNumber, setPhoneNumber] = useState('');

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

  const handleMakeCall = () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    // Navigate to active call screen
    router.push('/(modals)/active-call');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, styles.blur1, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]} />

      <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.phoneNumberCard}>
        <View style={styles.locationBadge}>
          <IconSymbol name="globe" size={14} color="#10B981" />
          <ThemedText style={styles.locationText}>Kenya (+254)</ThemedText>
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
            {row.map((key) => (
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
        <View style={styles.spacer} />
        <TouchableOpacity
          style={[styles.callButton, !phoneNumber && styles.callButtonDisabled]}
          disabled={!phoneNumber}
          onPress={handleMakeCall}
        >
          <IconSymbol name="phone.fill" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.spacer} />
      </View>
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
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 20 },
  callButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8, marginTop: 5 },
  callButtonDisabled: { backgroundColor: '#9CA3AF', shadowOpacity: 0 },
  spacer: { width: 56 },
});
