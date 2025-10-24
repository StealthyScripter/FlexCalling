import { StyleSheet, TouchableOpacity, View, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { useState } from 'react';
import { safeNavigateBack } from '@/utils/navigation';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const [notifications, setNotifications] = useState(true);
  const [callRecording, setCallRecording] = useState(false);
  const [autoAnswer, setAutoAnswer] = useState(false);
  const [vibration, setVibration] = useState(true);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)' }]} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => safeNavigateBack(router, '/(tabs)/account')} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={isDark ? '#F1F5F9' : '#111827'} />
        </TouchableOpacity>
        <ThemedText type="title">Settings</ThemedText>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Call Settings Section */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>CALL SETTINGS</ThemedText>

        <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.settingsCard}>
          <View style={[styles.settingItem, styles.settingBorder]}>
            <View style={styles.settingInfo}>
              <IconSymbol name="phone.fill" size={24} color="#10B981" />
              <View style={styles.settingText}>
                <ThemedText type="defaultSemiBold">Auto Answer</ThemedText>
                <ThemedText style={styles.settingDescription}>Answer calls automatically</ThemedText>
              </View>
            </View>
            <Switch
              value={autoAnswer}
              onValueChange={setAutoAnswer}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.settingItem, styles.settingBorder]}>
            <View style={styles.settingInfo}>
              <IconSymbol name="waveform" size={24} color="#3B82F6" />
              <View style={styles.settingText}>
                <ThemedText type="defaultSemiBold">Call Recording</ThemedText>
                <ThemedText style={styles.settingDescription}>Record all calls</ThemedText>
              </View>
            </View>
            <Switch
              value={callRecording}
              onValueChange={setCallRecording}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor="#fff"
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IconSymbol name="speaker.wave.3.fill" size={24} color="#F59E0B" />
              <View style={styles.settingText}>
                <ThemedText type="defaultSemiBold">Audio Quality</ThemedText>
                <ThemedText style={styles.settingDescription}>HD Voice</ThemedText>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
          </TouchableOpacity>
        </BlurView>

        {/* Notifications Section */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>NOTIFICATIONS</ThemedText>

        <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.settingsCard}>
          <View style={[styles.settingItem, styles.settingBorder]}>
            <View style={styles.settingInfo}>
              <IconSymbol name="bell.fill" size={24} color="#EC4899" />
              <View style={styles.settingText}>
                <ThemedText type="defaultSemiBold">Push Notifications</ThemedText>
                <ThemedText style={styles.settingDescription}>Incoming call alerts</ThemedText>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IconSymbol name="waveform.path" size={24} color="#8B5CF6" />
              <View style={styles.settingText}>
                <ThemedText type="defaultSemiBold">Vibration</ThemedText>
                <ThemedText style={styles.settingDescription}>Vibrate on incoming calls</ThemedText>
              </View>
            </View>
            <Switch
              value={vibration}
              onValueChange={setVibration}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor="#fff"
            />
          </View>
        </BlurView>

        {/* Account Section */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>ACCOUNT</ThemedText>

        <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.settingsCard}>
          <TouchableOpacity style={[styles.settingItem, styles.settingBorder]}>
            <View style={styles.settingInfo}>
              <IconSymbol name="dollarsign.circle.fill" size={24} color="#10B981" />
              <View style={styles.settingText}>
                <ThemedText type="defaultSemiBold">Billing & Payments</ThemedText>
                <ThemedText style={styles.settingDescription}>Manage payment methods</ThemedText>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, styles.settingBorder]}>
            <View style={styles.settingInfo}>
              <IconSymbol name="chart.bar.fill" size={24} color="#3B82F6" />
              <View style={styles.settingText}>
                <ThemedText type="defaultSemiBold">Usage Statistics</ThemedText>
                <ThemedText style={styles.settingDescription}>View call history & data</ThemedText>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IconSymbol name="person.circle.fill" size={24} color="#F59E0B" />
              <View style={styles.settingText}>
                <ThemedText type="defaultSemiBold">Profile Settings</ThemedText>
                <ThemedText style={styles.settingDescription}>Edit your information</ThemedText>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
          </TouchableOpacity>
        </BlurView>

        {/* Privacy & Security Section */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>PRIVACY & SECURITY</ThemedText>

        <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.settingsCard}>
          <TouchableOpacity style={[styles.settingItem, styles.settingBorder]}>
            <View style={styles.settingInfo}>
              <IconSymbol name="lock.shield.fill" size={24} color="#8B5CF6" />
              <View style={styles.settingText}>
                <ThemedText type="defaultSemiBold">Privacy Policy</ThemedText>
                <ThemedText style={styles.settingDescription}>View our privacy policy</ThemedText>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, styles.settingBorder]}>
            <View style={styles.settingInfo}>
              <IconSymbol name="hand.raised.fill" size={24} color="#EF4444" />
              <View style={styles.settingText}>
                <ThemedText type="defaultSemiBold">Blocked Numbers</ThemedText>
                <ThemedText style={styles.settingDescription}>Manage blocked contacts</ThemedText>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IconSymbol name="key.fill" size={24} color="#10B981" />
              <View style={styles.settingText}>
                <ThemedText type="defaultSemiBold">Change Password</ThemedText>
                <ThemedText style={styles.settingDescription}>Update your password</ThemedText>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
          </TouchableOpacity>
        </BlurView>

        {/* About Section */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>ABOUT</ThemedText>

        <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.settingsCard}>
          <TouchableOpacity style={[styles.settingItem, styles.settingBorder]}>
            <View style={styles.settingInfo}>
              <IconSymbol name="questionmark.circle.fill" size={24} color="#3B82F6" />
              <View style={styles.settingText}>
                <ThemedText type="defaultSemiBold">Help & Support</ThemedText>
                <ThemedText style={styles.settingDescription}>Get help with the app</ThemedText>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, styles.settingBorder]}>
            <View style={styles.settingInfo}>
              <IconSymbol name="doc.text.fill" size={24} color="#F59E0B" />
              <View style={styles.settingText}>
                <ThemedText type="defaultSemiBold">Terms of Service</ThemedText>
                <ThemedText style={styles.settingDescription}>Read our terms</ThemedText>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IconSymbol name="info.circle.fill" size={24} color="#6B7280" />
              <View style={styles.settingText}>
                <ThemedText type="defaultSemiBold">App Version</ThemedText>
                <ThemedText style={styles.settingDescription}>1.0.0</ThemedText>
              </View>
            </View>
          </View>
        </BlurView>

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
  sectionTitle: { fontSize: 12, letterSpacing: 1, opacity: 0.5, marginBottom: 12, marginTop: 24, paddingHorizontal: 20 },
  settingsCard: { marginHorizontal: 20, borderRadius: 24, padding: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 12 },
  settingBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  settingInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingText: { flex: 1 },
  settingDescription: { fontSize: 14, opacity: 0.6, marginTop: 2 },
});
