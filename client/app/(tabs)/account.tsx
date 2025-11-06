import { StyleSheet, TouchableOpacity, View, ScrollView, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/contexts/theme-context';
import { BlurView } from 'expo-blur';
import { useState, useEffect } from 'react';
import { AuthService } from '@/services/auth.services';

export default function AccountScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { toggleTheme } = useTheme();
  const isDark = colorScheme === 'dark';

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AuthService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleRefreshProfile = async () => {
    setIsLoading(true);
    try {
      const profile = await AuthService.getProfile();
      setUser(profile);
      Alert.alert('Success', 'Profile refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      Alert.alert('Error', 'Failed to refresh profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthService.logout();
              Alert.alert('Success', 'You have been signed out', [
                {
                  text: 'OK',
                  onPress: () => router.replace('/(auth)/onboarding'),
                },
              ]);
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    { icon: 'person.circle.fill' as const, label: 'Edit Profile', chevron: true, route: null },
    { icon: 'creditcard' as const, label: 'Payment Methods', chevron: true, route: null },
    { icon: 'gearshape.fill' as const, label: 'Settings', chevron: true, route: '/(modals)/settings' },
    { icon: 'questionmark.circle.fill' as const, label: 'Help & Support', chevron: true, route: null },
  ];

  const handleMenuPress = (route: string | null, label: string) => {
    if (route) {
      router.push(route as any);
    } else {
      Alert.alert('Coming Soon', `${label} feature will be available soon.`);
    }
  };

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title">Account</ThemedText>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ThemedText>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, styles.blur1, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)' }]} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText type="title">Account</ThemedText>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefreshProfile}
            disabled={isLoading}
          >
            <IconSymbol
              name="arrow.clockwise"
              size={24}
              color={isDark ? '#F1F5F9' : '#111827'}
            />
          </TouchableOpacity>
        </View>

        <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.profileCard}>
          <View style={[styles.profileAvatar, { backgroundColor: '#8B5CF6' }]}>
            <ThemedText style={styles.profileInitial}>{initials}</ThemedText>
          </View>
          <ThemedText type="title" style={styles.profileName}>{user.name}</ThemedText>
          <ThemedText style={styles.profilePhone}>{user.phone}</ThemedText>
          <ThemedText style={styles.profileEmail}>{user.email}</ThemedText>

          {!user.isVerified && (
            <View style={styles.verificationBadge}>
              <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#F59E0B" />
              <ThemedText style={styles.verificationText}>Account not verified</ThemedText>
            </View>
          )}
        </BlurView>

        <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.balanceCard}>
          <ThemedText style={styles.balanceLabel}>Account Balance</ThemedText>
          <ThemedText type="title" style={styles.balanceAmount}>
            ${user.balance?.toFixed(2) || '0.00'}
          </ThemedText>
          <TouchableOpacity style={styles.topUpButton}>
            <ThemedText style={styles.topUpText}>Top Up</ThemedText>
          </TouchableOpacity>
        </BlurView>

        <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.themeCard}>
          <View style={styles.themeToggle}>
            <View style={styles.themeInfo}>
              <IconSymbol name={isDark ? 'moon.fill' : 'sun.max.fill'} size={24} color={isDark ? '#F1F5F9' : '#111827'} />
              <ThemedText type="defaultSemiBold">Dark Mode</ThemedText>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor="#fff"
            />
          </View>
        </BlurView>

        <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, index !== menuItems.length - 1 && styles.menuBorder]}
              onPress={() => handleMenuPress(item.route, item.label)}
            >
              <IconSymbol name={item.icon} size={24} color={isDark ? '#94A3B8' : '#6B7280'} />
              <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
              {item.chevron && (
                <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
              )}
            </TouchableOpacity>
          ))}
        </BlurView>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <IconSymbol name="arrow.right.square.fill" size={20} color="#EF4444" />
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  decorativeBlur: { position: 'absolute', width: 280, height: 280, borderRadius: 200, top: -100, right: -80, opacity: 0.6 },
  blur1: {},
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 24 },
  refreshButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  profileCard: { marginHorizontal: 20, borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  profileAvatar: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  profileInitial: { color: '#fff', fontSize: 32, fontWeight: '600' },
  profileName: { marginBottom: 4 },
  profilePhone: { fontSize: 14, opacity: 0.6, marginBottom: 2 },
  profileEmail: { fontSize: 14, opacity: 0.6 },
  verificationBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 12 },
  verificationText: { fontSize: 12, color: '#F59E0B', fontWeight: '600' },
  balanceCard: { marginHorizontal: 20, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)'},
  balanceLabel: { fontSize: 12, opacity: 0.6, marginBottom: 8, letterSpacing: 1 },
  balanceAmount: { marginTop: 10, marginBottom: 16, fontSize: 36, padding: 5 },
  topUpButton: { backgroundColor: '#10B981', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 16 },
  topUpText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  themeCard: { marginHorizontal: 20, marginTop: 20, borderRadius: 24, padding: 20, marginBottom: 6, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  themeToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  themeInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuCard: { marginHorizontal: 20, borderRadius: 24, padding: 8, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12, gap: 12, marginBottom: 6 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  menuLabel: { flex: 1, fontSize: 16 },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, paddingVertical: 16, borderRadius: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  signOutText: { color: '#EF4444', fontWeight: '600', fontSize: 16 },
});
