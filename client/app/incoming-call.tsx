import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function IncomingCallScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.callerInfo}>
        <View style={styles.callerAvatar}>
          <ThemedText style={styles.callerInitial}>JD</ThemedText>
        </View>
        <ThemedText type="title" style={styles.callerName}>John Doe</ThemedText>
        <ThemedText style={styles.callerLocation}>Nairobi, Kenya</ThemedText>
        <ThemedText style={styles.callType}>FlexCalling</ThemedText>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.declineButton}>
          <IconSymbol name="phone.down.fill" size={32} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptButton}>
          <IconSymbol name="phone.fill" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 40 },
  callerInfo: { alignItems: 'center', marginTop: 100 },
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
  callerName: { marginBottom: 8 },
  callerLocation: { fontSize: 18, opacity: 0.6, marginBottom: 8 },
  callType: { fontSize: 16, opacity: 0.5 },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 60,
  },
  declineButton: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
