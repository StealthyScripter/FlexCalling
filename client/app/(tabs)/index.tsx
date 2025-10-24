import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { APIService, EnrichedCallLog } from '@/services/api.service';
import { useCall } from '@/contexts/call-context';

export default function RecentsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const { makeCall, isDeviceReady } = useCall();
  const [callLogs, setCallLogs] = useState<EnrichedCallLog[]>([]);

  // Fetch call logs from mock DB
  const fetchCallLogs = () => {
    setCallLogs(APIService.getCallLogs());
  };

  useEffect(() => {
    fetchCallLogs();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchCallLogs();
    }, [])
  );

  const getCallIcon = (call: EnrichedCallLog) => {
    const type = call.call?.direction === 'outgoing' ? 'outgoing' :
                 call.call?.direction === 'incoming' ? 'incoming' : 'missed';
    switch(type) {
      case 'outgoing': return 'phone.arrow.up.right.fill';
      case 'incoming': return 'phone.arrow.down.left.fill';
      case 'missed': return 'phone.down.fill';
      default: return 'phone.fill';
    }
  };

  const getCallColor = (call: EnrichedCallLog) => {
    const type = call.call?.direction === 'outgoing' ? 'outgoing' :
                 call.call?.direction === 'incoming' ? 'incoming' : 'missed';
    switch(type) {
      case 'outgoing': return '#10B981';
      case 'incoming': return '#3B82F6';
      case 'missed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const handleCallDetail = (call: EnrichedCallLog) => {
    if (call.call?.callSid) {
      router.push({
        pathname: '/(modals)/call-detail',
        params: { callSid: call.call.callSid }
      });
    }
  };

  const handleMakeCall = async (call: EnrichedCallLog) => {
    if (!isDeviceReady) return;
    if (!call.call?.to) return;
    try {
      await makeCall(call.call.to);
      router.push('/(modals)/active-call');
    } catch (error) {
      console.error('Failed to make call:', error);
    }
  };

  const renderCallItem = (call: EnrichedCallLog) => {
    const displayName = call.contactName || call.call?.to || 'Unknown';
    const phoneNumber = call.call?.direction === 'outgoing' ? call.call.to : call.call?.from;
    const initial = displayName[0]?.toUpperCase() || '?';
    const time = call.callStartTime ? timeSince(call.callStartTime) : 'Unknown';

    // UPDATED: Use contact avatar color if available
    const avatarColor = call.contactAvatar || '#3B82F6';

    return (
      <BlurView key={call.call?.callSid} intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.callCard}>
        <TouchableOpacity
          style={styles.callContent}
          onPress={() => handleCallDetail(call)}
        >
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <ThemedText style={styles.avatarText}>{initial}</ThemedText>
          </View>
          <View style={styles.callInfo}>
            <ThemedText type="defaultSemiBold">{displayName}</ThemedText>
            {call.contactName && (
              <ThemedText style={styles.phoneSubtext}>{phoneNumber}</ThemedText>
            )}
            <View style={styles.callMeta}>
              <View style={[styles.callBadge, { backgroundColor: getCallColor(call) + '20' }]}>
                <IconSymbol name={getCallIcon(call)} size={12} color={getCallColor(call)} />
                <ThemedText style={[styles.callTime, { color: getCallColor(call) }]}>{time}</ThemedText>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.callButton, { backgroundColor: '#10B981' }]}
            onPress={() => handleMakeCall(call)}
          >
            <IconSymbol name="phone.fill" size={20} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>
      </BlurView>
    );
  };

  const timeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return days === 1 ? 'Yesterday' : `${days}d`;
  };

  const today = callLogs.filter(call => {
    if (!call.callStartTime) return false;
    const todayDate = new Date();
    return call.callStartTime.toDateString() === todayDate.toDateString();
  });

  const earlier = callLogs.filter(call => {
    if (!call.callStartTime) return false;
    const todayDate = new Date();
    return call.callStartTime.toDateString() !== todayDate.toDateString();
  });

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, styles.blur1, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }]} />
      <View style={[styles.decorativeBlur, styles.blur2, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]} />

      <View style={styles.header}>
        <View>
          <ThemedText type="title">Recents</ThemedText>
          <ThemedText style={styles.subtitle}>Your call history</ThemedText>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchCallLogs}>
          <IconSymbol name="arrow.clockwise" size={24} color={isDark ? '#F1F5F9' : '#111827'} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {today.length > 0 && <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>TODAY</ThemedText>}
        {today.map(call => <View key={call.call?.callSid} style={{ marginBottom: 12 }}>{renderCallItem(call)}</View>)}

        {earlier.length > 0 && <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { marginTop: 24 }]}>EARLIER</ThemedText>}
        {earlier.map(call => <View key={call.call?.callSid} style={{ marginBottom: 12 }}>{renderCallItem(call)}</View>)}

        {callLogs.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 100 }}>
            <ThemedText style={{ opacity: 0.6 }}>No call history yet</ThemedText>
          </View>
        )}
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
  phoneSubtext: { fontSize: 12, opacity: 0.5, marginTop: 2 }, // ADDED
  callMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  callBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  callTime: { fontSize: 12, fontWeight: '600' },
  callButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});
