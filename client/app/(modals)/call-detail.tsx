import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { useState, useEffect } from 'react';
import { APIService } from '@/services/api.service';

// Import types and helpers
import type { EnrichedCallLog } from '@/types';
import {
  formatDuration,
  formatFullDateTime,
  formatCurrency,
  getCallTypeColor,
  getCallTypeIcon,
  getCallTypeLabel,
  getFirstInitial,
  getDisplayName,
} from '@/utils';

export default function CallDetailScreen() {
  const router = useRouter();
  const { callSid } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const [callLog, setCallLog] = useState<EnrichedCallLog | null>(null);

  useEffect(() => {
    if (callSid && typeof callSid === 'string') {
      const allLogs = APIService.getCallLogs();
      const foundLog = allLogs.find(log => log.call?.callSid === callSid);
      if (foundLog) {
        setCallLog(foundLog);
      }
    }
  }, [callSid]);

  if (!callLog || !callLog.call) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.decorativeBlur, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]} />

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)');
              }
            }}
            style={styles.backButton}
          >
            <IconSymbol name="chevron.left" size={24} color={isDark ? '#F1F5F9' : '#111827'} />
          </TouchableOpacity>
          <ThemedText type="title">Call Not Found</ThemedText>
          <View style={styles.spacer} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ThemedText style={{ opacity: 0.6 }}>Call details not available</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const call = callLog.call;
  const phoneNumber = call.direction === 'outgoing' ? call.to : call.from;

  // Use helpers for display
  const displayName = getDisplayName(callLog.contactName, phoneNumber);
  const initial = getFirstInitial(displayName);
  const avatarColor = callLog.contactAvatar || '#3B82F6';

  // Call type info using helpers
  const callType = call.direction || 'outgoing';
  const callTypeColor = getCallTypeColor(callType);
  const callTypeIcon = getCallTypeIcon(callType);
  const callTypeLabel = getCallTypeLabel(callType);

  // Format duration using helper
  const durationStr = formatDuration(callLog.callDuration);

  // Format cost using helper
  const cost = formatCurrency(callLog.estimatedCost);
  const ratePerMin = `${formatCurrency(callLog.ratePerMinute)}/min`;

  // Format date and time using helpers
  const callDate = callLog.callStartTime || new Date();
  const fullDateTime = formatFullDateTime(callDate);

  const handleCallBack = () => {
    router.push('/(tabs)/keypad');
  };

  const handleViewContact = () => {
    if (callLog.contactId) {
      router.push({
        pathname: '/(modals)/contact-detail',
        params: { contactId: callLog.contactId }
      });
    } else {
      router.push('/(modals)/add-contact');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, { backgroundColor: callTypeColor + '15' }]} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Contact/Caller Card */}
        <BlurView intensity={isDark ? 30 : 70} tint={colorScheme} style={styles.callerCard}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <ThemedText style={styles.avatarText}>{initial}</ThemedText>
          </View>

          <ThemedText type="title" style={styles.callerName}>{displayName}</ThemedText>

          {callLog.contactName && (
            <View style={styles.phoneBadge}>
              <IconSymbol name="phone.fill" size={14} color={isDark ? '#94A3B8' : '#6B7280'} />
              <ThemedText style={styles.phoneNumber}>{phoneNumber}</ThemedText>
            </View>
          )}

          {/* Call Type Badge - Color Coded */}
          <View style={[styles.callTypeBadge, { backgroundColor: callTypeColor + '20' }]}>
            <IconSymbol name={callTypeIcon} size={18} color={callTypeColor} />
            <ThemedText style={[styles.callTypeText, { color: callTypeColor }]}>
              {callTypeLabel}
            </ThemedText>
          </View>
        </BlurView>

        {/* Call Summary */}
        <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <IconSymbol name="timer" size={20} color="#10B981" />
              <ThemedText style={styles.summaryLabel}>Duration</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.summaryValue}>{durationStr}</ThemedText>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <IconSymbol name="dollarsign.circle.fill" size={20} color="#F59E0B" />
              <ThemedText style={styles.summaryLabel}>Cost</ThemedText>
              <ThemedText type="defaultSemiBold" style={[styles.summaryValue, { color: '#10B981' }]}>{cost}</ThemedText>
            </View>
          </View>
        </BlurView>

        {/* Call Information */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>CALL INFORMATION</ThemedText>

        <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.infoCard}>
          <View style={[styles.infoItem, styles.infoBorder]}>
            <View style={[styles.infoIcon, { backgroundColor: callTypeColor + '15' }]}>
              <IconSymbol name={callTypeIcon} size={20} color={callTypeColor} />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Type</ThemedText>
              <ThemedText type="defaultSemiBold">{callTypeLabel}</ThemedText>
            </View>
          </View>

          <View style={[styles.infoItem, styles.infoBorder]}>
            <View style={styles.infoIcon}>
              <IconSymbol name="calendar" size={20} color="#3B82F6" />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Date & Time</ThemedText>
              <ThemedText type="defaultSemiBold">{fullDateTime}</ThemedText>
            </View>
          </View>

          <View style={[styles.infoItem, styles.infoBorder]}>
            <View style={styles.infoIcon}>
              <IconSymbol name="phone.fill" size={20} color="#10B981" />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Phone Number</ThemedText>
              <ThemedText type="defaultSemiBold">{phoneNumber}</ThemedText>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <IconSymbol name="waveform" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Rate</ThemedText>
              <ThemedText type="defaultSemiBold">{ratePerMin}</ThemedText>
            </View>
          </View>
        </BlurView>

        {/* Quick Actions */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>QUICK ACTIONS</ThemedText>

        <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.actionsCard}>
          <TouchableOpacity style={[styles.actionItem, styles.actionBorder]} onPress={handleCallBack}>
            <IconSymbol name="phone.fill" size={20} color="#10B981" />
            <ThemedText style={styles.actionText}>Call Back</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, styles.actionBorder]} onPress={handleViewContact}>
            <IconSymbol name="person.crop.circle" size={20} color="#8B5CF6" />
            <ThemedText style={styles.actionText}>
              {callLog.contactId ? 'View Contact' : 'Add to Contacts'}
            </ThemedText>
            <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
          </TouchableOpacity>
        </BlurView>

        {/* Report Issue */}
        <TouchableOpacity style={styles.reportButton}>
          <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#EF4444" />
          <ThemedText style={styles.reportText}>Report an Issue</ThemedText>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  decorativeBlur: { position: 'absolute', width: 280, height: 280, borderRadius: 200, top: -100, right: -80, opacity: 0.6 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 24 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  spacer: { width: 44 },

  // Caller Card
  callerCard: { marginHorizontal: 20, borderRadius: 32, padding: 32, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  avatar: { width: 100, height: 100, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  avatarText: { color: '#fff', fontSize: 40, fontWeight: '600' },
  callerName: { marginBottom: 12 },
  phoneBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, marginBottom: 12 },
  phoneNumber: { fontSize: 14, fontWeight: '600', opacity: 0.7 },
  callTypeBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 16 },
  callTypeText: { fontSize: 16, fontWeight: '700' },

  // Summary Card
  summaryCard: { marginHorizontal: 20, borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center', gap: 8 },
  summaryDivider: { width: 1, height: 60, backgroundColor: 'rgba(0,0,0,0.1)', marginHorizontal: 20 },
  summaryLabel: { fontSize: 12, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryValue: { fontSize: 20 },

  // Section Title
  sectionTitle: { fontSize: 12, letterSpacing: 1, opacity: 0.5, marginBottom: 12, marginTop: 8, paddingHorizontal: 20 },

  // Info Card
  infoCard: { marginHorizontal: 20, borderRadius: 24, padding: 8, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  infoItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12, gap: 12 },
  infoBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  infoIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 13, opacity: 0.6, marginBottom: 4 },

  // Actions Card
  actionsCard: { marginHorizontal: 20, borderRadius: 24, padding: 8, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  actionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12, gap: 12 },
  actionBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  actionText: { flex: 1, fontSize: 16 },

  // Report Button
  reportButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, paddingVertical: 16, borderRadius: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  reportText: { color: '#EF4444', fontSize: 14, fontWeight: '600' },
});
