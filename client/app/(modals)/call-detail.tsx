import { StyleSheet, TouchableOpacity, View, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { useTwilioContext } from '@/contexts/twilio-context';

export default function CallDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const { makeCall, isInitialized } = useTwilioContext();

  // Get call data from params (in real app, fetch from database using callId)
  const callId = params.callId as string;
  const name = (params.name as string) || 'Unknown';
  const phone = (params.phone as string) || 'Unknown';

  // Mock call data (TODO: fetch from database using callId)
  const callData = {
    id: callId,
    name: name,
    phone: phone,
    type: 'outgoing',
    status: 'completed',
    date: 'Today, 2:30 PM',
    duration: '12:45',
    cost: '$0.64',
    quality: 'Excellent',
    location: 'Nairobi, Kenya',
    recordingUrl: null, // TODO: get from database
  };

  const handleCallBack = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'Calling service not ready');
      return;
    }

    if (!callData.phone || callData.phone === 'Unknown') {
      Alert.alert('Error', 'Phone number not available');
      return;
    }

    try {
      console.log(`📞 Calling back ${callData.name} at ${callData.phone}`);
      await makeCall(callData.phone, {
        callerName: callData.name,
      });
    } catch (error: any) {
      console.error('❌ Call failed:', error);
      Alert.alert('Call Failed', error?.message || 'Unable to place call');
    }
  };

  const handleSendMessage = () => {
    Alert.alert('Coming Soon', 'SMS feature will be available soon');
  };

  const handleBlockNumber = () => {
    Alert.alert(
      'Block Number',
      `Block ${callData.phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => {
            // TODO: Add to blocked numbers
            Alert.alert('Blocked', `${callData.phone} has been blocked`);
          },
        },
      ]
    );
  };

  const handleDeleteCall = () => {
    Alert.alert(
      'Delete Call',
      'Delete this call from history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Delete from database
            Alert.alert('Deleted', 'Call deleted from history', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  };

  const getCallTypeIcon = () => {
    switch (callData.type) {
      case 'outgoing':
        return 'phone.arrow.up.right.fill';
      case 'incoming':
        return 'phone.arrow.down.left.fill';
      case 'missed':
        return 'phone.down.fill';
      default:
        return 'phone.fill';
    }
  };

  const getCallTypeColor = () => {
    switch (callData.type) {
      case 'outgoing':
        return '#10B981';
      case 'incoming':
        return '#3B82F6';
      case 'missed':
        return '#EF4444';
      default:
        return '#6B7280';
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
        <TouchableOpacity onPress={handleDeleteCall} style={styles.deleteButton}>
          <IconSymbol name="trash.fill" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Call Header */}
        <BlurView intensity={isDark ? 30 : 70} tint={colorScheme} style={styles.headerCard}>
          <View style={[styles.avatar, { backgroundColor: getCallTypeColor() }]}>
            <ThemedText style={styles.avatarText}>{callData.name[0]?.toUpperCase() || '?'}</ThemedText>
          </View>
          <ThemedText type="title" style={styles.name}>{callData.name}</ThemedText>
          <View style={styles.phoneBadge}>
            <IconSymbol name="phone.fill" size={14} color={getCallTypeColor()} />
            <ThemedText style={[styles.phone, { color: getCallTypeColor() }]}>{callData.phone}</ThemedText>
          </View>

          <View style={styles.callTypeBadge}>
            <IconSymbol name={getCallTypeIcon()} size={16} color={getCallTypeColor()} />
            <ThemedText style={[styles.callTypeText, { color: getCallTypeColor() }]}>
              {callData.type.charAt(0).toUpperCase() + callData.type.slice(1)}
            </ThemedText>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#10B981' }]}
              onPress={handleCallBack}
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
              style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
              onPress={handleBlockNumber}
            >
              <IconSymbol name="hand.raised.fill" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </BlurView>

        {/* Call Info */}
        <View style={styles.infoSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Call Information</ThemedText>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <IconSymbol name="calendar" size={20} color="#3B82F6" />
              </View>
              <View style={styles.infoText}>
                <ThemedText style={styles.infoLabel}>Date & Time</ThemedText>
                <ThemedText type="defaultSemiBold">{callData.date}</ThemedText>
              </View>
            </View>
          </BlurView>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <IconSymbol name="clock.fill" size={20} color="#10B981" />
              </View>
              <View style={styles.infoText}>
                <ThemedText style={styles.infoLabel}>Duration</ThemedText>
                <ThemedText type="defaultSemiBold">{callData.duration}</ThemedText>
              </View>
            </View>
          </BlurView>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <IconSymbol name="dollarsign.circle.fill" size={20} color="#F59E0B" />
              </View>
              <View style={styles.infoText}>
                <ThemedText style={styles.infoLabel}>Cost</ThemedText>
                <ThemedText type="defaultSemiBold" style={{ color: '#F59E0B' }}>{callData.cost}</ThemedText>
              </View>
            </View>
          </BlurView>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <IconSymbol name="waveform" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.infoText}>
                <ThemedText style={styles.infoLabel}>Call Quality</ThemedText>
                <ThemedText type="defaultSemiBold">{callData.quality}</ThemedText>
              </View>
            </View>
          </BlurView>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <IconSymbol name="mappin.circle.fill" size={20} color="#EC4899" />
              </View>
              <View style={styles.infoText}>
                <ThemedText style={styles.infoLabel}>Location</ThemedText>
                <ThemedText type="defaultSemiBold">{callData.location}</ThemedText>
              </View>
            </View>
          </BlurView>

          {callData.recordingUrl && (
            <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.recordingCard}>
              <View style={styles.recordingIcon}>
                <IconSymbol name="waveform.circle.fill" size={24} color="#10B981" />
              </View>
              <View style={styles.recordingInfo}>
                <ThemedText type="defaultSemiBold">Call Recording</ThemedText>
                <ThemedText style={styles.recordingDuration}>Duration: {callData.duration}</ThemedText>
              </View>
              <TouchableOpacity style={styles.playButton}>
                <IconSymbol name="play.fill" size={20} color="#10B981" />
              </TouchableOpacity>
            </BlurView>
          )}
        </View>

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
  deleteButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(239, 68, 68, 0.1)', justifyContent: 'center', alignItems: 'center' },
  headerCard: { marginHorizontal: 20, borderRadius: 32, padding: 32, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  avatar: { width: 100, height: 100, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  avatarText: { color: '#fff', fontSize: 40, fontWeight: '600' },
  name: { marginBottom: 12 },
  phoneBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, marginBottom: 12 },
  phone: { fontSize: 16, fontWeight: '600' },
  callTypeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, marginBottom: 24 },
  callTypeText: { fontSize: 14, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 16 },
  actionButton: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  infoSection: { paddingHorizontal: 20 },
  sectionTitle: { marginBottom: 16 },
  infoCard: { marginBottom: 12, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(59, 130, 246, 0.1)', justifyContent: 'center', alignItems: 'center' },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 14, opacity: 0.6, marginBottom: 4 },
  recordingCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 20, padding: 16, marginTop: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  recordingIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center' },
  recordingInfo: { flex: 1 },
  recordingDuration: { fontSize: 12, opacity: 0.6, marginTop: 2 },
  playButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center' },
});
