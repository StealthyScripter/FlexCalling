import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';

export default function ContactDetailScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const callHistory = [
    { id: '1', date: 'Today, 2:30 PM', duration: '12:45', cost: '$0.64', type: 'outgoing' },
    { id: '2', date: 'Yesterday, 5:15 PM', duration: '8:20', cost: '$0.42', type: 'incoming' },
    { id: '3', date: 'Dec 28, 11:30 AM', duration: '25:10', cost: '$1.26', type: 'outgoing' },
  ];

  const handleMakeCall = () => {
    router.push('/(modals)/active-call');
  };

  const handleSendMessage = () => {
    // TODO: Implement messaging
    console.log('Send message');
  };

  const handleVideoCall = () => {
    // TODO: Implement video call
    console.log('Video call');
  };

  const handleCallDetail = (call: any) => {
    router.push('/(modals)/call-detail');
  };

  const handleEditContact = () => {
    router.push('/(modals)/edit-contact');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)' }]} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={isDark ? '#F1F5F9' : '#111827'} />
        </TouchableOpacity>
        <ThemedText type="title">Contact Details</ThemedText>
        <TouchableOpacity onPress={handleEditContact} style={styles.editButton}>
          <IconSymbol name="pencil.circle.fill" size={28} color="#10B981" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <BlurView intensity={isDark ? 30 : 70} tint={colorScheme} style={styles.headerCard}>
          <View style={[styles.avatar, { backgroundColor: '#F59E0B' }]}>
            <ThemedText style={styles.avatarText}>JD</ThemedText>
          </View>
          <ThemedText type="title" style={styles.name}>John Doe</ThemedText>
          <View style={styles.phoneBadge}>
            <IconSymbol name="phone.fill" size={14} color="#10B981" />
            <ThemedText style={styles.phone}>+254 712 345 678</ThemedText>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#10B981' }]}
              onPress={handleMakeCall}
            >
              <IconSymbol name="phone.fill" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
              onPress={handleSendMessage}
            >
              <IconSymbol name="message.fill" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
              onPress={handleVideoCall}
            >
              <IconSymbol name="video.fill" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </BlurView>

        <View style={styles.historySection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Call History</ThemedText>
          {callHistory.map((item) => (
            <BlurView key={item.id} intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.historyCard}>
              <TouchableOpacity
                style={styles.historyContent}
                onPress={() => handleCallDetail(item)}
              >
                <View style={[styles.callTypeIcon, { backgroundColor: item.type === 'outgoing' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)' }]}>
                  <IconSymbol
                    name={item.type === 'outgoing' ? 'phone.arrow.up.right.fill' : 'phone.arrow.down.left.fill'}
                    size={16}
                    color={item.type === 'outgoing' ? '#10B981' : '#3B82F6'}
                  />
                </View>
                <View style={styles.historyInfo}>
                  <ThemedText type="defaultSemiBold">{item.date}</ThemedText>
                  <ThemedText style={styles.historyDetail}>Duration: {item.duration}</ThemedText>
                </View>
                <ThemedText style={styles.cost}>{item.cost}</ThemedText>
              </TouchableOpacity>
            </BlurView>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  decorativeBlur: { position: 'absolute', width: 280, height: 280, borderRadius: 200, top: -100, right: -80, opacity: 0.6 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 24 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  editButton: {},
  headerCard: { marginHorizontal: 20, borderRadius: 32, padding: 32, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  avatar: { width: 100, height: 100, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  avatarText: { color: '#fff', fontSize: 40, fontWeight: '600' },
  name: { marginBottom: 12 },
  phoneBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, marginBottom: 24 },
  phone: { fontSize: 16, color: '#10B981', fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 16 },
  actionButton: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  historySection: { paddingHorizontal: 20, paddingBottom: 100 },
  sectionTitle: { marginBottom: 16 },
  historyCard: { marginBottom: 12, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  historyContent: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  callTypeIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  historyInfo: { flex: 1 },
  historyDetail: { fontSize: 14, opacity: 0.6, marginTop: 4 },
  cost: { fontSize: 18, fontWeight: '700', color: '#10B981' },
});
