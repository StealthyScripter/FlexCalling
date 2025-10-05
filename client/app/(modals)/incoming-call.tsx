import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';

export default function IncomingCallScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, styles.blur1, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)' }]} />
      <View style={[styles.decorativeBlur, styles.blur2, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)' }]} />

      <View style={styles.callerInfo}>
        <BlurView intensity={isDark ? 30 : 70} tint={colorScheme} style={styles.callerCard}>
          <View style={[styles.callerAvatar, { backgroundColor: '#3B82F6' }]}>
            <ThemedText style={styles.callerInitial}>JD</ThemedText>
          </View>
          <ThemedText type="title" style={styles.callerName}>John Doe</ThemedText>
          <View style={styles.locationBadge}>
            <IconSymbol name="mappin.circle.fill" size={16} color="#10B981" />
            <ThemedText style={styles.callerLocation}>Nairobi, Kenya</ThemedText>
          </View>
          <View style={styles.callTypeBadge}>
            <ThemedText style={styles.callType}>FlexCalling</ThemedText>
          </View>
        </BlurView>
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
  callTypeBadge: { backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12 },
  callType: { fontSize: 14, color: '#3B82F6', fontWeight: '600' },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 40 },
  declineButton: { width: 75, height: 75, borderRadius: 38, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  acceptButton: { width: 75, height: 75, borderRadius: 38, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
});
