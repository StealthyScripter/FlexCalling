import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';

// Define types for route items
type RouteItem = {
  name: string;
  route: string;
  icon: string;
  color: string;
  highlight?: boolean;
};

type NavigationSection = {
  section: string;
  routes: RouteItem[];
};

export default function TestNavigationScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const navigationTests: NavigationSection[] = [
    {
      section: 'AUTH SCREENS',
      routes: [
        { name: 'Onboarding', route: '/(auth)/onboarding', icon: 'sparkles', color: '#8B5CF6' },
        { name: 'Login', route: '/(auth)/login', icon: 'arrow.right.square.fill', color: '#3B82F6' },
        { name: 'Signup', route: '/(auth)/signup', icon: 'person.badge.plus.fill', color: '#10B981' },
      ],
    },
    {
      section: 'MAIN TABS',
      routes: [
        { name: 'Recents', route: '/(tabs)', icon: 'clock.fill', color: '#EC4899' },
        { name: 'Keypad', route: '/(tabs)/keypad', icon: 'square.grid.3x3.fill', color: '#10B981' },
        { name: 'Contacts', route: '/(tabs)/contacts', icon: 'person.2.fill', color: '#3B82F6' },
        { name: 'Account', route: '/(tabs)/account', icon: 'person.crop.circle.fill', color: '#F59E0B' },
      ],
    },
    {
      section: 'CALL SCREENS (MODALS)',
      routes: [
        { name: 'Incoming Call', route: '/(modals)/incoming-call', icon: 'phone.arrow.down.left.fill', color: '#3B82F6', highlight: true },
        { name: 'Active Call', route: '/(modals)/active-call', icon: 'phone.fill', color: '#10B981', highlight: true },
      ],
    },
    {
      section: 'CONTACT SCREENS',
      routes: [
        { name: 'Contact Detail', route: '/(modals)/contact-detail', icon: 'person.crop.circle', color: '#8B5CF6' },
        { name: 'Add Contact', route: '/(modals)/add-contact', icon: 'person.badge.plus', color: '#10B981' },
        { name: 'Edit Contact', route: '/(modals)/edit-contact', icon: 'pencil.circle.fill', color: '#F59E0B' },
      ],
    },
    {
      section: 'OTHER SCREENS',
      routes: [
        { name: 'Call Detail', route: '/(modals)/call-detail', icon: 'info.circle.fill', color: '#3B82F6' },
        { name: 'Settings', route: '/(modals)/settings', icon: 'gearshape.fill', color: '#6B7280' },
      ],
    },
  ];

  const handleNavigate = (route: string, name: string) => {
    console.log(`Navigating to: ${route}`);
    try {
      router.push(route as any);
    } catch (error) {
      console.error(`Failed to navigate to ${name}:`, error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)' }]} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={isDark ? '#F1F5F9' : '#111827'} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <ThemedText type="title">Test Navigation</ThemedText>
          <ThemedText style={styles.subtitle}>Test all screens & routes</ThemedText>
        </View>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.infoCard}>
          <IconSymbol name="info.circle.fill" size={24} color="#3B82F6" />
          <View style={styles.infoContent}>
            <ThemedText type="defaultSemiBold">Testing Guide</ThemedText>
            <ThemedText style={styles.infoText}>
              Tap any button to navigate to that screen. Highlighted buttons are for conditional screens like incoming/active calls.
            </ThemedText>
          </View>
        </BlurView>

        {navigationTests.map((section, sectionIndex) => (
          <View key={sectionIndex}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              {section.section}
            </ThemedText>

            <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.routesCard}>
              {section.routes.map((route, routeIndex) => (
                <TouchableOpacity
                  key={routeIndex}
                  style={[
                    styles.routeButton,
                    route.highlight && styles.routeButtonHighlight,
                    routeIndex !== section.routes.length - 1 && styles.routeBorder,
                  ]}
                  onPress={() => handleNavigate(route.route, route.name)}
                >
                  <View style={[styles.routeIcon, { backgroundColor: route.color + '20' }]}>
                    <IconSymbol name={route.icon as any} size={24} color={route.color} />
                  </View>
                  <View style={styles.routeInfo}>
                    <ThemedText type="defaultSemiBold">{route.name}</ThemedText>
                    <ThemedText style={styles.routePath}>{route.route}</ThemedText>
                  </View>
                  {route.highlight && (
                    <View style={styles.highlightBadge}>
                      <ThemedText style={styles.highlightText}>MODAL</ThemedText>
                    </View>
                  )}
                  <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
                </TouchableOpacity>
              ))}
            </BlurView>
          </View>
        ))}

        {/* Quick Test Buttons */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          QUICK TESTS
        </ThemedText>

        <View style={styles.quickTestsGrid}>
          <TouchableOpacity
            style={[styles.quickTestButton, { backgroundColor: '#3B82F6' }]}
            onPress={() => handleNavigate('/(modals)/incoming-call', 'Incoming Call')}
          >
            <IconSymbol name="phone.arrow.down.left.fill" size={32} color="#fff" />
            <ThemedText style={styles.quickTestText}>Incoming Call</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickTestButton, { backgroundColor: '#10B981' }]}
            onPress={() => handleNavigate('/(modals)/active-call', 'Active Call')}
          >
            <IconSymbol name="phone.fill" size={32} color="#fff" />
            <ThemedText style={styles.quickTestText}>Active Call</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickTestButton, { backgroundColor: '#8B5CF6' }]}
            onPress={() => handleNavigate('/(modals)/contact-detail', 'Contact Detail')}
          >
            <IconSymbol name="person.crop.circle" size={32} color="#fff" />
            <ThemedText style={styles.quickTestText}>Contact Detail</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickTestButton, { backgroundColor: '#F59E0B' }]}
            onPress={() => handleNavigate('/(modals)/call-detail', 'Call Detail')}
          >
            <IconSymbol name="info.circle.fill" size={32} color="#fff" />
            <ThemedText style={styles.quickTestText}>Call Detail</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.statsCard}>
          <View style={styles.statItem}>
            <ThemedText type="title" style={{ color: '#10B981' }}>
              {navigationTests.reduce((acc, section) => acc + section.routes.length, 0)}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Total Screens</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText type="title" style={{ color: '#3B82F6' }}>
              {navigationTests.length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Categories</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText type="title" style={{ color: '#8B5CF6' }}>
              {navigationTests.filter(s => s.routes.some(r => r.highlight)).reduce((acc, section) => acc + section.routes.filter(r => r.highlight).length, 0)}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Modal Screens</ThemedText>
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
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 24 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  headerContent: { flex: 1, paddingLeft: 16 },
  subtitle: { fontSize: 14, opacity: 0.6, marginTop: 4 },
  spacer: { width: 44 },
  infoCard: { marginHorizontal: 20, borderRadius: 20, padding: 16, flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: 24, backgroundColor: 'rgba(59, 130, 246, 0.05)' },
  infoContent: { flex: 1 },
  infoText: { fontSize: 14, opacity: 0.7, marginTop: 4 },
  sectionTitle: { fontSize: 12, letterSpacing: 1, opacity: 0.5, marginBottom: 12, marginTop: 24, paddingHorizontal: 20 },
  routesCard: { marginHorizontal: 20, borderRadius: 24, padding: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  routeButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12, gap: 12 },
  routeButtonHighlight: { backgroundColor: 'rgba(59, 130, 246, 0.05)' },
  routeBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  routeIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  routeInfo: { flex: 1 },
  routePath: { fontSize: 12, opacity: 0.5, marginTop: 2, fontFamily: 'monospace' },
  highlightBadge: { backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  highlightText: { fontSize: 10, fontWeight: '700', color: '#3B82F6', letterSpacing: 0.5 },
  quickTestsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20 },
  quickTestButton: { flex: 1, minWidth: '45%', aspectRatio: 1.2, borderRadius: 20, justifyContent: 'center', alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
  quickTestText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  statsCard: { marginHorizontal: 20, borderRadius: 20, padding: 20, flexDirection: 'row', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden', marginTop: 24 },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 12, opacity: 0.6, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginHorizontal: 8 },
});
