import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';

export default function RecentsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const recentCalls = [
    { id: '1', name: 'Sarah Chen', initial: 'S', time: '2m', type: 'missed', location: 'Nairobi, Kenya', avatarColor: '#EC4899' },
    { id: '2', name: 'Mike Johnson', initial: 'M', time: '1h', type: 'incoming', location: 'Mombasa, Kenya', avatarColor: '#10B981' },
  ];

  const earlierCalls = [
    { id: '3', name: 'Emma Wilson', initial: 'E', time: '3h', type: 'outgoing', location: 'Kisumu, Kenya', avatarColor: '#3B82F6' },
    { id: '4', name: 'Unknown', initial: '?', time: 'Yesterday', type: 'missed', location: 'Kenya', avatarColor: '#6B7280' },
    { id: '5', name: 'Dad', initial: 'D', time: 'Yesterday', type: 'incoming', location: 'Nairobi, Kenya', avatarColor: '#8B5CF6' },
  ];

  const getCallIcon = (type: string) => {
    switch(type) {
      case 'outgoing': return 'phone.arrow.up.right.fill';
      case 'incoming': return 'phone.arrow.down.left.fill';
      case 'missed': return 'phone.down.fill';
      default: return 'phone.fill';
    }
  };

  const getCallColor = (type: string) => {
    switch(type) {
      case 'outgoing': return '#10B981';
      case 'incoming': return '#3B82F6';
      case 'missed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderCallItem = ({ item }: any) => (
    <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.callCard}>
      <View style={styles.callContent}>
        <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
          <ThemedText style={styles.avatarText}>{item.initial}</ThemedText>
        </View>
        <View style={styles.callInfo}>
          <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
          <View style={styles.callMeta}>
            <View style={[styles.callBadge, { backgroundColor: getCallColor(item.type) + '20' }]}>
              <IconSymbol name={getCallIcon(item.type)} size={12} color={getCallColor(item.type)} />
              <ThemedText style={[styles.callTime, { color: getCallColor(item.type) }]}>{item.time}</ThemedText>
            </View>
          </View>
        </View>
        <TouchableOpacity style={[styles.callButton, { backgroundColor: '#10B981' }]}>
          <IconSymbol name="phone.fill" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </BlurView>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Decorative background blurs */}
      <View style={[styles.decorativeBlur, styles.blur1, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }]} />
      <View style={[styles.decorativeBlur, styles.blur2, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]} />

      <View style={styles.header}>
        <View>
          <ThemedText type="title">Recents</ThemedText>
          <ThemedText style={styles.subtitle}>Your call history</ThemedText>
        </View>
        <TouchableOpacity style={styles.refreshButton}>
          <IconSymbol name="arrow.clockwise" size={24} color={isDark ? '#F1F5F9' : '#111827'} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>TODAY</ThemedText>
        {recentCalls.map((item) => (
          <View key={item.id} style={{ marginBottom: 12 }}>
            {renderCallItem({ item })}
          </View>
        ))}

        <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { marginTop: 24 }]}>EARLIER</ThemedText>
        {earlierCalls.map((item) => (
          <View key={item.id} style={{ marginBottom: 12 }}>
            {renderCallItem({ item })}
          </View>
        ))}

      </ScrollView>
      
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  decorativeBlur: { position: 'absolute', borderRadius: 200, opacity: 0.6 },
  blur1: { width: 300, height: 300, top: -100, right: -100 },
  blur2: { width: 250, height: 250, bottom: 100, left: -80 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 24 },
  subtitle: { fontSize: 14, opacity: 0.6, marginTop: 4 },
  refreshButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 12, letterSpacing: 1, opacity: 0.5, marginBottom: 16, paddingHorizontal: 20 },
  callCard: { marginHorizontal: 20, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  callContent: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  avatar: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '600' },
  callInfo: { flex: 1 },
  callMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  callBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  callTime: { fontSize: 12, fontWeight: '600' },
  callButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  statsCard: { marginHorizontal: 20, borderRadius: 20, padding: 20, flexDirection: 'row', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 12, opacity: 0.6, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginHorizontal: 8 },
  fab: { position: 'absolute', bottom: 100, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
});
