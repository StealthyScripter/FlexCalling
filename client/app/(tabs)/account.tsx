import { StyleSheet, TouchableOpacity, View, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/contexts/theme-context';
import { BlurView } from 'expo-blur';

export default function AccountScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { toggleTheme } = useTheme();
  const isDark = colorScheme === 'dark';

  const menuItems = [
    { icon: 'person.circle.fill' as const, label: 'Edit Profile', chevron: true, route: null },
    { icon: 'creditcard' as const, label: 'Payment Methods', chevron: true, route: null },
    { icon: 'clock.fill' as const, label: 'Call History', chevron: true, route: null },
    { icon: 'gearshape.fill' as const, label: 'Settings', chevron: true, route: '/(modals)/settings' },
    { icon: 'questionmark.circle.fill' as const, label: 'Help & Support', chevron: true, route: null },
  ];

  const handleMenuPress = (route: string | null, label: string) => {
    if (route) {
      router.push(route as any);
    } else {
      console.log(`${label} - Not implemented yet`);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, styles.blur1, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)' }]} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText type="title">Account</ThemedText>
        </View>

        {/* DEV MODE - Test Navigation Banner */}
        <TouchableOpacity
          style={styles.devBanner}
          onPress={() => router.push('/(modals)/test-navigation')}
        >
          <View style={styles.devBannerContent}>
            <IconSymbol name="wrench.and.screwdriver.fill" size={24} color="#8B5CF6" />
            <View style={styles.devBannerText}>
              <ThemedText type="defaultSemiBold" style={{ color: '#8B5CF6' }}>
                Developer Mode
              </ThemedText>
              <ThemedText style={styles.devBannerSubtext}>
                Test all screens & navigation
              </ThemedText>
            </View>
          </View>
          <IconSymbol name="chevron.right" size={20} color="#8B5CF6" />
        </TouchableOpacity>

        <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.profileCard}>
          <View style={[styles.profileAvatar, { backgroundColor: '#8B5CF6' }]}>
            <ThemedText style={styles.profileInitial}>JD</ThemedText>
          </View>
          <ThemedText type="title" style={styles.profileName}>John Doe</ThemedText>
          <ThemedText style={styles.profilePhone}>+1 (555) 123-4567</ThemedText>
        </BlurView>

        <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.balanceCard}>
          <ThemedText style={styles.balanceLabel}>Account Balance</ThemedText>
          <ThemedText type="title" style={styles.balanceAmount}>$25.50</ThemedText>
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

        <TouchableOpacity style={styles.signOutButton}>
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
  header: { paddingHorizontal: 20, marginBottom: 24 },
  devBanner: { marginHorizontal: 20, marginBottom: 16, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(139, 92, 246, 0.15)', borderWidth: 2, borderColor: '#8B5CF6', borderStyle: 'dashed' },
  devBannerContent: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  devBannerText: { flex: 1 },
  devBannerSubtext: { fontSize: 12, opacity: 0.7, marginTop: 2, color: '#8B5CF6' },
  profileCard: { marginHorizontal: 20, borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  profileAvatar: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  profileInitial: { color: '#fff', fontSize: 32, fontWeight: '600' },
  profileName: { marginBottom: 4 },
  profilePhone: { fontSize: 14, opacity: 0.6 },
  balanceCard: { marginHorizontal: 20, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)'},
  balanceLabel: { fontSize: 12, opacity: 0.6, marginBottom: 8, letterSpacing: 1 },
  balanceAmount: { marginTop: 10, marginBottom: 16, fontSize: 36, padding: 5 },
  topUpButton: { backgroundColor: '#10B981', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 16 },
  topUpText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  themeCard: { marginHorizontal: 20, borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  themeToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  themeInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuCard: { marginHorizontal: 20, borderRadius: 24, padding: 8, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12, gap: 12 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  menuLabel: { flex: 1, fontSize: 16 },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, paddingVertical: 16, borderRadius: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  signOutText: { color: '#EF4444', fontWeight: '600', fontSize: 16 },
});
