import { StyleSheet, TouchableOpacity, View, ScrollView, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';

export default function AccountScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [callRecordingEnabled, setCallRecordingEnabled] = useState(false);
  const [autoAnswerEnabled, setAutoAnswerEnabled] = useState(false);

  const handleEditProfile = () => {
    router.push('/(modals)/edit-profile');
  };

  const handlePaymentMethods = () => {
    Alert.alert('Coming Soon', 'Payment methods will be available soon');
  };

  const handleCallHistory = () => {
    router.push('/(tabs)');
  };

  const handleBlockedNumbers = () => {
    Alert.alert('Coming Soon', 'Blocked numbers will be available soon');
  };

  const handlePrivacy = () => {
    Alert.alert('Coming Soon', 'Privacy settings will be available soon');
  };

  const handleHelp = () => {
    Alert.alert('Coming Soon', 'Help & Support will be available soon');
  };

  const handleAbout = () => {
    Alert.alert(
      'FlexCalling',
      'Version 1.0.0\n\nAI-Powered International Calling Platform\n\n© 2025 FlexCalling Inc.'
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // TODO: Clear auth session
            Alert.alert('Logged Out', 'You have been logged out successfully');
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, styles.blur1, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)' }]} />

      <View style={styles.header}>
        <ThemedText type="title">Account</ThemedText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <BlurView intensity={isDark ? 30 : 70} tint={colorScheme} style={styles.profileCard}>
          <View style={[styles.profileAvatar, { backgroundColor: '#8B5CF6' }]}>
            <ThemedText style={styles.profileAvatarText}>JD</ThemedText>
          </View>
          <View style={styles.profileInfo}>
            <ThemedText type="subtitle">John Doe</ThemedText>
            <ThemedText style={styles.profileEmail}>john.doe@example.com</ThemedText>
            <View style={styles.balanceBadge}>
              <IconSymbol name="dollarsign.circle.fill" size={16} color="#10B981" />
              <ThemedText style={styles.balanceText}>Balance: $25.50</ThemedText>
            </View>
          </View>
          <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
            <IconSymbol name="pencil.circle.fill" size={28} color="#8B5CF6" />
          </TouchableOpacity>
        </BlurView>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>QUICK ACTIONS</ThemedText>

          <TouchableOpacity onPress={handlePaymentMethods}>
            <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.menuCard}>
              <View style={styles.menuContent}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <IconSymbol name="creditcard.fill" size={24} color="#10B981" />
                </View>
                <View style={styles.menuText}>
                  <ThemedText type="defaultSemiBold">Payment Methods</ThemedText>
                  <ThemedText style={styles.menuSubtext}>Add or manage payment methods</ThemedText>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleCallHistory}>
            <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.menuCard}>
              <View style={styles.menuContent}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <IconSymbol name="clock.fill" size={24} color="#3B82F6" />
                </View>
                <View style={styles.menuText}>
                  <ThemedText type="defaultSemiBold">Call History</ThemedText>
                  <ThemedText style={styles.menuSubtext}>View all your calls</ThemedText>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleBlockedNumbers}>
            <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.menuCard}>
              <View style={styles.menuContent}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <IconSymbol name="hand.raised.fill" size={24} color="#EF4444" />
                </View>
                <View style={styles.menuText}>
                  <ThemedText type="defaultSemiBold">Blocked Numbers</ThemedText>
                  <ThemedText style={styles.menuSubtext}>Manage blocked contacts</ThemedText>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>SETTINGS</ThemedText>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.toggleCard}>
            <View style={styles.menuContent}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <IconSymbol name="bell.fill" size={24} color="#F59E0B" />
              </View>
              <View style={styles.menuText}>
                <ThemedText type="defaultSemiBold">Notifications</ThemedText>
                <ThemedText style={styles.menuSubtext}>Call and message alerts</ThemedText>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: '#10B981' }}
              thumbColor={'#fff'}
            />
          </BlurView>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.toggleCard}>
            <View style={styles.menuContent}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                <IconSymbol name="waveform.circle.fill" size={24} color="#EC4899" />
              </View>
              <View style={styles.menuText}>
                <ThemedText type="defaultSemiBold">Call Recording</ThemedText>
                <ThemedText style={styles.menuSubtext}>Auto-record calls</ThemedText>
              </View>
            </View>
            <Switch
              value={callRecordingEnabled}
              onValueChange={setCallRecordingEnabled}
              trackColor={{ false: '#767577', true: '#10B981' }}
              thumbColor={'#fff'}
            />
          </BlurView>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.toggleCard}>
            <View style={styles.menuContent}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                <IconSymbol name="phone.arrow.down.left.fill" size={24} color="#8B5CF6" />
              </View>
              <View style={styles.menuText}>
                <ThemedText type="defaultSemiBold">Auto Answer</ThemedText>
                <ThemedText style={styles.menuSubtext}>Answer calls automatically</ThemedText>
              </View>
            </View>
            <Switch
              value={autoAnswerEnabled}
              onValueChange={setAutoAnswerEnabled}
              trackColor={{ false: '#767577', true: '#10B981' }}
              thumbColor={'#fff'}
            />
          </BlurView>

          <TouchableOpacity onPress={handlePrivacy}>
            <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.menuCard}>
              <View style={styles.menuContent}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <IconSymbol name="lock.fill" size={24} color="#3B82F6" />
                </View>
                <View style={styles.menuText}>
                  <ThemedText type="defaultSemiBold">Privacy & Security</ThemedText>
                  <ThemedText style={styles.menuSubtext}>Manage your privacy</ThemedText>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>SUPPORT</ThemedText>

          <TouchableOpacity onPress={handleHelp}>
            <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.menuCard}>
              <View style={styles.menuContent}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <IconSymbol name="questionmark.circle.fill" size={24} color="#10B981" />
                </View>
                <View style={styles.menuText}>
                  <ThemedText type="defaultSemiBold">Help & Support</ThemedText>
                  <ThemedText style={styles.menuSubtext}>Get help with FlexCalling</ThemedText>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleAbout}>
            <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.menuCard}>
              <View style={styles.menuContent}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                  <IconSymbol name="info.circle.fill" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.menuText}>
                  <ThemedText type="defaultSemiBold">About</ThemedText>
                  <ThemedText style={styles.menuSubtext}>App version and info</ThemedText>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <IconSymbol name="arrow.right.square.fill" size={20} color="#EF4444" />
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  decorativeBlur: { position: 'absolute', borderRadius: 200, opacity: 0.6 },
  blur1: { width: 280, height: 280, top: -100, right: -80 },
  header: { paddingHorizontal: 20, marginBottom: 24 },
  profileCard: { marginHorizontal: 20, borderRadius: 24, padding: 20, marginBottom: 24, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  profileAvatar: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  profileAvatarText: { color: '#fff', fontSize: 24, fontWeight: '600' },
  profileInfo: { flex: 1, marginLeft: 16 },
  profileEmail: { fontSize: 14, opacity: 0.6, marginTop: 4 },
  balanceBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 8, alignSelf: 'flex-start' },
  balanceText: { fontSize: 14, color: '#10B981', fontWeight: '600' },
  editButton: {},
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 12, letterSpacing: 1, opacity: 0.5, marginBottom: 12 },
  menuCard: { borderRadius: 20, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  toggleCard: { borderRadius: 20, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  menuContent: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  menuIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  menuText: { flex: 1 },
  menuSubtext: { fontSize: 12, opacity: 0.6, marginTop: 2 },
  logoutButton: { marginHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 16, borderRadius: 16, marginTop: 16 },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '600' },
});
