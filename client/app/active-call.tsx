import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ActiveCallScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.callerInfo}>
        <View style={styles.callerAvatar}>
          <ThemedText style={styles.callerInitial}>JD</ThemedText>
        </View>
        <ThemedText type="title" style={styles.callerName}>John Doe</ThemedText>
        <ThemedText style={styles.callDuration}>05:32</ThemedText>
        <ThemedText style={styles.callRate}>$0.05/min to Kenya</ThemedText>
      </View>

      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <TouchableOpacity style={styles.controlButton}>
            <IconSymbol name="mic.slash.fill" size={28} color="#fff" />
            <ThemedText style={styles.controlLabel}>Mute</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <IconSymbol name="speaker.wave.3.fill" size={28} color="#fff" />
            <ThemedText style={styles.controlLabel}>Speaker</ThemedText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.endCallButton}>
          <IconSymbol name="phone.down.fill" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 40 },
  callerInfo: { alignItems: 'center', marginTop: 80 },
  callerAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  callerInitial: { color: '#fff', fontSize: 48, fontWeight: '600' },
  callerName: { marginBottom: 16 },
  callDuration: { fontSize: 24, marginBottom: 8 },
  callRate: { fontSize: 14, opacity: 0.6 },
  controls: { alignItems: 'center', gap: 40, marginBottom: 40 },
  controlRow: { flexDirection: 'row', gap: 40 },
  controlButton: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: '#3A3A3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlLabel: { fontSize: 12, marginTop: 8, color: '#fff' },
  endCallButton: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
