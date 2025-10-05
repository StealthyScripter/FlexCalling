import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { useState } from 'react';

export default function ActiveCallScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, styles.blur1, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)' }]} />

      <View style={styles.callerInfo}>
        <BlurView intensity={isDark ? 30 : 70} tint={colorScheme} style={styles.callerCard}>
          <View style={[styles.callerAvatar, { backgroundColor: '#8B5CF6' }]}>
            <ThemedText style={styles.callerInitial}>JD</ThemedText>
          </View>
          <ThemedText type="title" style={styles.callerName}>John Doe</ThemedText>
          <View style={styles.durationBadge}>
            <View style={styles.pulseDot} />
            <ThemedText style={styles.callDuration}>05:32</ThemedText>
          </View>
          <View style={styles.rateBadge}>
            <IconSymbol name="dollarsign.circle.fill" size={16} color="#10B981" />
            <ThemedText style={styles.callRate}>$0.05/min to Kenya</ThemedText>
          </View>
        </BlurView>
      </View>

      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <IconSymbol name={isMuted ? "mic.slash.fill" : "mic.fill"} size={24} color="#fff" />
            <ThemedText style={styles.controlLabel}>Mute</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, isSpeaker && styles.controlButtonActive]}
            onPress={() => setIsSpeaker(!isSpeaker)}
          >
            <IconSymbol name="speaker.wave.3.fill" size={24} color="#fff" />
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
  decorativeBlur: { position: 'absolute', width: 320, height: 320, borderRadius: 200, top: -120, left: -100 },
  blur1: {},
  callerInfo: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  callerCard: { borderRadius: 32, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  callerAvatar: { width: 120, height: 120, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  callerInitial: { color: '#fff', fontSize: 48, fontWeight: '600' },
  callerName: { marginBottom: 16 },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginBottom: 12 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  callDuration: { fontSize: 20, fontWeight: '600', color: '#10B981' },
  rateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12 },
  callRate: { fontSize: 14, opacity: 0.8 },
  controls: { alignItems: 'center', gap: 32, marginBottom: 40 },
  controlRow: { flexDirection: 'row', gap: 32 },
  controlButton: { width: 75, height: 75, borderRadius: 38, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', gap: 4 },
  controlButtonActive: { backgroundColor: '#10B981' },
  controlLabel: { fontSize: 11, marginTop: 4, color: '#fff', fontWeight: '600' },
  endCallButton: { width: 75, height: 75, borderRadius: 38, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
});
