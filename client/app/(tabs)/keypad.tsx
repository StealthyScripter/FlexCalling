import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';

export default function KeypadScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, styles.blur1, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]} />

      <View style={styles.header}>
        <ThemedText type="title">Keypad</ThemedText>
      </View>

      <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.phoneNumberCard}>
        <View style={styles.locationBadge}>
          <IconSymbol name="globe" size={14} color="#10B981" />
          <ThemedText style={styles.locationText}>Kenya (+254)</ThemedText>
        </View>
        <ThemedText type="title" style={styles.phoneNumber}>
          +1 234 567 8900
          <TouchableOpacity style={styles.deleteButton}>
            <IconSymbol name="delete.left.fill" size={24} color={isDark ? '#F1F5F9' : '#111827'} />
          </TouchableOpacity>
        </ThemedText>
      </BlurView>

      <View style={styles.keypadContainer}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyRow}>
            {row.map((key) => (
              <BlurView key={key} intensity={isDark ? 15 : 40} tint={colorScheme} style={styles.key}>
                <TouchableOpacity style={styles.keyTouchable}>
                  <ThemedText type="title" style={styles.keyText}>{key}</ThemedText>
                </TouchableOpacity>
              </BlurView>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.callButton}>
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
  header: { paddingHorizontal: 20, marginBottom: 24 },
  phoneNumberCard: { marginHorizontal: 20, borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 40, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  phoneNumber: { fontSize: 28, marginBottom: 12 },
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  locationText: { fontSize: 14, color: '#10B981', fontWeight: '600' },
  keypadContainer: { flex: 1, justifyContent: 'center', gap: 16, paddingHorizontal: 20 },
  keyRow: { flexDirection: 'row', justifyContent: 'space-around', gap: 16 },
  key: { flex: 1, aspectRatio: 1, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  keyTouchable: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  keyText: { fontSize: 28 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 20, marginBottom: 100 },
  deleteButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  callButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  spacer: { width: 56 },
});
