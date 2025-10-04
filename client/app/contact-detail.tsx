import { StyleSheet, TouchableOpacity, View, FlatList } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ContactDetailScreen() {
  const callHistory = [
    { id: '1', date: 'Today, 2:30 PM', duration: '12:45', cost: '$0.64' },
    { id: '2', date: 'Yesterday, 5:15 PM', duration: '8:20', cost: '$0.42' },
    { id: '3', date: 'Dec 28, 11:30 AM', duration: '25:10', cost: '$1.26' },
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <ThemedText style={styles.avatarText}>JD</ThemedText>
        </View>
        <ThemedText type="title" style={styles.name}>John Doe</ThemedText>
        <ThemedText style={styles.phone}>+254 712 345 678</ThemedText>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <IconSymbol name="phone.fill" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <IconSymbol name="message.fill" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.historySection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Call History</ThemedText>
        <FlatList
          data={callHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <View style={styles.historyInfo}>
                <ThemedText type="defaultSemiBold">{item.date}</ThemedText>
                <ThemedText style={styles.historyDetail}>Duration: {item.duration}</ThemedText>
              </View>
              <ThemedText style={styles.cost}>{item.cost}</ThemedText>
            </View>
          )}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { alignItems: 'center', paddingVertical: 20 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: { color: '#fff', fontSize: 40, fontWeight: '600' },
  name: { marginBottom: 8 },
  phone: { fontSize: 16, opacity: 0.6, marginBottom: 20 },
  actions: { flexDirection: 'row', gap: 20 },
  actionButton: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historySection: { flex: 1, marginTop: 30 },
  sectionTitle: { marginBottom: 16 },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
  },
  historyInfo: { flex: 1 },
  historyDetail: { fontSize: 14, opacity: 0.6, marginTop: 4 },
  cost: { fontSize: 16, fontWeight: '600', color: '#34C759' },
});
