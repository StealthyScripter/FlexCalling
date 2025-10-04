// app/(tabs)/index.tsx - RECENTS SCREEN
import { StyleSheet, FlatList, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function RecentsScreen() {
  const iconColor = useThemeColor({}, 'icon');

  const recentCalls = [
    { id: '1', name: 'John Doe', time: '2:30 PM', type: 'outgoing', location: 'Nairobi, Kenya' },
    { id: '2', name: 'Jane Smith', time: '11:45 AM', type: 'incoming', location: 'Mombasa, Kenya' },
    { id: '3', name: 'Mike Johnson', time: 'Yesterday', type: 'missed', location: 'Kisumu, Kenya' },
  ];

  return (
    <ScreenContainer>
      <ThemedText type="title" style={styles.title}>Recents</ThemedText>

      <FlatList
        data={recentCalls}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.callItem}>
            <View style={styles.callInfo}>
              <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
              <ThemedText style={styles.location}>{item.location}</ThemedText>
            </View>
            <View style={styles.callMeta}>
              <ThemedText style={styles.time}>{item.time}</ThemedText>
              <IconSymbol
                name={item.type === 'outgoing' ? 'phone.arrow.up.right.fill' : 'phone.arrow.down.left.fill'}
                size={16}
                color={item.type === 'missed' ? '#ff3b30' : iconColor}
              />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <IconSymbol name="phone.fill" size={48} color={iconColor} />
            <ThemedText style={styles.emptyText}>No recent calls</ThemedText>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: 20 },
  callItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
  },
  callInfo: { flex: 1 },
  location: { fontSize: 14, opacity: 0.6, marginTop: 4 },
  callMeta: { alignItems: 'flex-end', gap: 4 },
  time: { fontSize: 14, opacity: 0.6 },
  emptyState: { alignItems: 'center', marginTop: 100, gap: 16 },
  emptyText: { opacity: 0.6 },
});
