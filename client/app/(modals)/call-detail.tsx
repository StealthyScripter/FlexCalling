import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';

export default function CallDetailScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  // TODO: Get actual call data from route params
  const callData = {
    contact: 'John Doe',
    phoneNumber: '+254 712 345 678',
    type: 'outgoing',
    status: 'completed',
    date: 'December 30, 2024',
    time: '2:30 PM',
    duration: '12:45',
    cost: '$0.64',
    quality: 'HD',
    location: 'Nairobi, Kenya',
    recordingUrl: null,
  };

  const getCallTypeColor = (type: string) => {
    switch (type) {
      case 'outgoing': return '#10B981';
      case 'incoming': return '#3B82F6';
      case 'missed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getCallTypeIcon = (type: string) => {
    switch (type) {
      case 'outgoing': return 'phone.arrow.up.right.fill';
      case 'incoming': return 'phone.arrow.down.left.fill';
      case 'missed': return 'phone.down.fill';
      default: return 'phone.fill';
    }
  };

  const getCallTypeLabel = (type: string) => {
    switch (type) {
      case 'outgoing': return 'Outgoing Call';
      case 'incoming': return 'Incoming Call';
      case 'missed': return 'Missed Call';
      default: return 'Call';
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={isDark ? '#F1F5F9' : '#111827'} />
        </TouchableOpacity>
        <ThemedText type="title">Call Details</ThemedText>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Contact Info Card */}
        <BlurView intensity={isDark ? 30 : 70} tint={colorScheme} style={styles.contactCard}>
          <View style={[styles.avatar, { backgroundColor: getCallTypeColor(callData.type) }]}>
            <ThemedText style={styles.avatarText}>{callData.contact[0]}</ThemedText>
          </View>
          <ThemedText type="title" style={styles.contactName}>{callData.contact}</ThemedText>
          <View style={styles.phoneBadge}>
            <IconSymbol name="phone.fill" size={14} color={isDark ? '#94A3B8' : '#6B7280'} />
            <ThemedText style={styles.phoneNumber}>{callData.phoneNumber}</ThemedText>
          </View>
          <View style={[styles.callTypeBadge, { backgroundColor: getCallTypeColor(callData.type) + '20' }]}>
            <IconSymbol name={getCallTypeIcon(callData.type)} size={16} color={getCallTypeColor(callData.type)} />
            <ThemedText style={[styles.callTypeText, { color: getCallTypeColor(callData.type) }]}>
              {getCallTypeLabel(callData.type)}
            </ThemedText>
          </View>
        </BlurView>

        {/* Call Information */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>CALL INFORMATION</ThemedText>

        <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.infoCard}>
          <View style={[styles.infoItem, styles.infoBorder]}>
            <View style={styles.infoIcon}>
              <IconSymbol name="calendar" size={20} color="#3B82F6" />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Date</ThemedText>
              <ThemedText type="defaultSemiBold">{callData.date}</ThemedText>
            </View>
          </View>

          <View style={[styles.infoItem, styles.infoBorder]}>
            <View style={styles.infoIcon}>
              <IconSymbol name="clock.fill" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Time</ThemedText>
              <ThemedText type="defaultSemiBold">{callData.time}</ThemedText>
            </View>
          </View>

          <View style={[styles.infoItem, styles.infoBorder]}>
            <View style={styles.infoIcon}>
              <IconSymbol name="timer" size={20} color="#10B981" />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Duration</ThemedText>
              <ThemedText type="defaultSemiBold">{callData.duration}</ThemedText>
            </View>
          </View>

          <View style={[styles.infoItem, styles.infoBorder]}>
            <View style={styles.infoIcon}>
              <IconSymbol name="dollarsign.circle.fill" size={20} color="#F59E0B" />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Cost</ThemedText>
              <ThemedText type="defaultSemiBold" style={{ color: '#10B981' }}>{callData.cost}</ThemedText>
            </View>
          </View>

          <View style={[styles.infoItem, styles.infoBorder]}>
            <View style={styles.infoIcon}>
              <IconSymbol name="waveform" size={20} color="#EC4899" />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Quality</ThemedText>
              <ThemedText type="defaultSemiBold">{callData.quality} Voice</ThemedText>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <IconSymbol name="mappin.circle.fill" size={20} color="#EF4444" />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Location</ThemedText>
              <ThemedText type="defaultSemiBold">{callData.location}</ThemedText>
            </View>
          </View>
        </BlurView>

        {/* Recording Section (if available) */}
        {callData.recordingUrl && (
          <>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>RECORDING</ThemedText>

            <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.recordingCard}>
              <View style={styles.recordingHeader}>
                <IconSymbol name="waveform.path" size={24} color="#8B5CF6" />
                <ThemedText type="defaultSemiBold">Call Recording</ThemedText>
              </View>
              <View style={styles.recordingControls}>
                <TouchableOpacity style={styles.playButton}>
                  <IconSymbol name="play.fill" size={20} color="#fff" />
                </TouchableOpacity>
                <View style={styles.waveform}>
                  <View style={styles.waveformBar} />
                  <View style={[styles.waveformBar, { height: 30 }]} />
                  <View style={[styles.waveformBar, { height: 20 }]} />
                  <View style={[styles.waveformBar, { height: 35 }]} />
                  <View style={styles.waveformBar} />
                  <View style={[styles.waveformBar, { height: 25 }]} />
                </View>
                <TouchableOpacity style={styles.downloadButton}>
                  <IconSymbol name="arrow.down.circle.fill" size={24} color="#10B981" />
                </TouchableOpacity>
              </View>
            </BlurView>
          </>
        )}

        {/* Quick Actions */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>QUICK ACTIONS</ThemedText>

        <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.actionsCard}>
          <TouchableOpacity style={[styles.actionItem, styles.actionBorder]}>
            <IconSymbol name="phone.fill" size={20} color="#10B981" />
            <ThemedText style={styles.actionText}>Call Back</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, styles.actionBorder]}>
            <IconSymbol name="message.fill" size={20} color="#3B82F6" />
            <ThemedText style={styles.actionText}>Send Message</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, styles.actionBorder]}>
            <IconSymbol name="person.crop.circle" size={20} color="#8B5CF6" />
            <ThemedText style={styles.actionText}>View Contact</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <IconSymbol name="square.and.arrow.up.fill" size={20} color="#F59E0B" />
            <ThemedText style={styles.actionText}>Share Call Details</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
          </TouchableOpacity>
        </BlurView>

        {/* Report Issue */}
        <TouchableOpacity style={styles.reportButton}>
          <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#EF4444" />
          <ThemedText style={styles.reportText}>Report an Issue with this Call</ThemedText>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  decorativeBlur: { position: 'absolute', width: 280, height: 280, borderRadius: 200, top: -100, right: -80, opacity: 0.6 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 24 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  spacer: { width: 44 },
  contactCard: { marginHorizontal: 20, borderRadius: 32, padding: 32, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  avatar: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '600' },
  contactName: { marginBottom: 12 },
  phoneBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, marginBottom: 12 },
  phoneNumber: { fontSize: 16, fontWeight: '600' },
  callTypeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  callTypeText: { fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 12, letterSpacing: 1, opacity: 0.5, marginBottom: 12, marginTop: 24, paddingHorizontal: 20 },
  infoCard: { marginHorizontal: 20, borderRadius: 24, padding: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  infoItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12, gap: 12 },
  infoBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  infoIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 14, opacity: 0.6, marginBottom: 4 },
  recordingCard: { marginHorizontal: 20, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  recordingHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  recordingControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  playButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center' },
  waveform: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, height: 40 },
  waveformBar: { flex: 1, height: 24, backgroundColor: 'rgba(139, 92, 246, 0.3)', borderRadius: 2 },
  downloadButton: {},
  actionsCard: { marginHorizontal: 20, borderRadius: 24, padding: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  actionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12, gap: 12 },
  actionBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  actionText: { flex: 1, fontSize: 16 },
  reportButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, marginTop: 24, paddingVertical: 16, borderRadius: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  reportText: { color: '#EF4444', fontSize: 14, fontWeight: '600' },
});
