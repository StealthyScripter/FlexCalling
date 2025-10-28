import { StyleSheet, TouchableOpacity, View, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { useState, useEffect } from 'react';
import { APIService } from '@/services/api.service';
import { useCall } from '@/contexts/call-context';

// Import types and helpers
import type { Contact, EnrichedCallLog } from '@/types';
import {
  formatDate,
  formatTime,
  formatDuration,
  formatCurrency,
  getCallTypeColor,
  getCallTypeIcon,
  getInitials,
} from '@/utils';

export default function ContactDetailScreen() {
  const router = useRouter();
  const { contactId } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const { makeCall, isDeviceReady } = useCall();

  const [contact, setContact] = useState<Contact | null>(null);
  const [callHistory, setCallHistory] = useState<EnrichedCallLog[]>([]);

  useEffect(() => {
    if (contactId && typeof contactId === 'string') {
      const foundContact = APIService.getContactById(contactId);
      if (foundContact) {
        setContact(foundContact);
        const history = APIService.getCallLogsForContact(foundContact.phone);
        setCallHistory(history);
      }
    }
  }, [contactId]);

  if (!contact) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)/contacts');
              }
            }}
            style={styles.backButton}
          >
            <IconSymbol name="chevron.left" size={24} color={isDark ? '#F1F5F9' : '#111827'} />
          </TouchableOpacity>
          <ThemedText type="title">Contact Not Found</ThemedText>
          <View style={styles.spacer} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ThemedText style={{ opacity: 0.6 }}>Contact not available</ThemedText>
        </View>
      </ThemedView>
    );
  }

  // Use helpers for contact display
  const displayName = contact.name;
  const displayPhone = contact.phone;
  const initials = getInitials(contact.name);
  const avatarColor = contact.avatarColor;

  const handleMakeCall = async () => {
    if (!isDeviceReady) {
      Alert.alert('Not Ready', 'Device is not ready to make calls');
      return;
    }

    try {
      await makeCall(contact.phone);
      router.push('/(modals)/active-call');
    } catch (error) {
      console.error('Failed to make call:', error);
      Alert.alert('Error', 'Failed to make call');
    }
  };

  const handleCallDetail = (callLog: EnrichedCallLog) => {
    if (callLog.call?.callSid) {
      router.push({
        pathname: '/(modals)/call-detail',
        params: { callSid: callLog.call.callSid }
      });
    }
  };

  const handleEditContact = () => {
    router.push({
      pathname: '/(modals)/edit-contact',
      params: { contactId: contact.id }
    });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)' }]} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Contact Information Card */}
        <BlurView intensity={isDark ? 30 : 70} tint={colorScheme} style={styles.contactCard}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <ThemedText style={styles.avatarText}>{initials}</ThemedText>
          </View>

          <ThemedText type="title" style={styles.name}>{displayName}</ThemedText>

          <View style={styles.phoneBadge}>
            <IconSymbol name="phone.fill" size={16} color="#10B981" />
            <ThemedText style={styles.phone}>{displayPhone}</ThemedText>
          </View>

          {contact.favorite && (
            <View style={styles.favoriteBadge}>
              <IconSymbol name="star.fill" size={16} color="#F59E0B" />
              <ThemedText style={styles.favoriteText}>Favorite</ThemedText>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#10B981' }]}
              onPress={handleMakeCall}
            >
              <IconSymbol name="phone.fill" size={24} color="#fff" />
              <ThemedText style={styles.actionButtonText}>Call</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleEditContact} style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}>
              <IconSymbol name="pencil.circle.fill" size={28} color="#fff" />
              <ThemedText style={styles.actionButtonText}>Edit</ThemedText>
            </TouchableOpacity>
          </View>
        </BlurView>

        {/* Call History Section */}
        <View style={styles.historySection}>
          <View style={styles.historySectionHeader}>
            <ThemedText type="subtitle">Call History</ThemedText>
            <View style={styles.historyCount}>
              <ThemedText style={styles.historyCountText}>{callHistory.length}</ThemedText>
            </View>
          </View>

          {callHistory.length === 0 ? (
            <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.emptyCard}>
              <IconSymbol name="phone.fill" size={48} color={isDark ? '#475569' : '#94A3B8'} />
              <ThemedText style={styles.emptyText}>No call history with this contact</ThemedText>
            </BlurView>
          ) : (
            callHistory.map((callLog) => {
              if (!callLog.call || !callLog.callStartTime) return null;

              const direction = callLog.call.direction;
              const color = getCallTypeColor(direction);
              const icon = getCallTypeIcon(direction) as any;
              const duration = formatDuration(callLog.callDuration);
              const date = formatDate(callLog.callStartTime);
              const time = formatTime(callLog.callStartTime);
              const cost = formatCurrency(callLog.estimatedCost);

              return (
                <BlurView
                  key={callLog.call.callSid}
                  intensity={isDark ? 20 : 60}
                  tint={colorScheme}
                  style={styles.historyCard}
                >
                  <TouchableOpacity
                    style={styles.historyContent}
                    onPress={() => handleCallDetail(callLog)}
                  >
                    {/* Call Type Icon */}
                    <View style={[styles.callTypeIcon, { backgroundColor: color + '20' }]}>
                      <IconSymbol name={icon} size={20} color={color} />
                    </View>

                    {/* Call Info */}
                    <View style={styles.historyInfo}>
                      <View style={styles.historyRow}>
                        <ThemedText type="defaultSemiBold" style={{ color }}>
                          {direction === 'outgoing' ? 'Outgoing' :
                           direction === 'incoming' ? 'Incoming' : 'Missed'}
                        </ThemedText>
                        <ThemedText style={styles.historyCost}>{cost}</ThemedText>
                      </View>

                      <View style={styles.historyRow}>
                        <ThemedText style={styles.historyDetail}>
                          {date} at {time}
                        </ThemedText>
                        <ThemedText style={styles.historyDuration}>{duration}</ThemedText>
                      </View>
                    </View>

                    {/* Chevron */}
                    <IconSymbol name="chevron.right" size={20} color={isDark ? '#64748B' : '#94A3B8'} />
                  </TouchableOpacity>
                </BlurView>
              );
            })
          )}
        </View>

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

  // Contact Card
  contactCard: { marginHorizontal: 20, borderRadius: 32, padding: 32, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  avatar: { width: 100, height: 100, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  avatarText: { color: '#fff', fontSize: 40, fontWeight: '600' },
  name: { marginBottom: 12 },
  phoneBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, marginBottom: 12 },
  phone: { fontSize: 16, color: '#10B981', fontWeight: '600' },
  favoriteBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 20 },
  favoriteText: { fontSize: 14, color: '#F59E0B', fontWeight: '600' },

  // Action Buttons
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  actionButton: { flex: 1, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 16, alignItems: 'center', gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 },
  actionButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // History Section
  historySection: { paddingHorizontal: 20, paddingBottom: 20 },
  historySectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  historyCount: { backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  historyCountText: { fontSize: 14, fontWeight: '700', color: '#10B981' },

  // Empty State
  emptyCard: { borderRadius: 20, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  emptyText: { fontSize: 14, opacity: 0.6, marginTop: 12, textAlign: 'center' },

  // History Card
  historyCard: { marginBottom: 12, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  historyContent: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  callTypeIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  historyInfo: { flex: 1, gap: 4 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyDetail: { fontSize: 13, opacity: 0.6 },
  historyCost: { fontSize: 16, fontWeight: '700', color: '#10B981' },
  historyDuration: { fontSize: 13, opacity: 0.7, fontWeight: '600' },
});
