import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { useCall } from '@/contexts/call-context';

export default function SplashScreen() {
  const router = useRouter();
  const { registerDevice } = useCall();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    const initialize = async () => {
      // Check authentication
      const isAuthenticated = false; // Replace with actual auth check

      if (isAuthenticated) {
        // Register device with Twilio
        try {
          const token = 'YOUR_ACCESS_TOKEN'; // Get from backend
          await registerDevice(token);
        } catch (error) {
          console.error('Failed to register device:', error);
        }

        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/onboarding');
      }
    };

    const timer = setTimeout(initialize, 2000);
    return () => clearTimeout(timer);
  }, [registerDevice, router]);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)' }]} />

      <BlurView intensity={isDark ? 30 : 70} tint={colorScheme} style={styles.logoCard}>
        <View style={styles.logoContainer}>
          <IconSymbol name="phone.circle.fill" size={80} color="#10B981" />
        </View>
        <ThemedText type="title" style={styles.title}>FlexCalling</ThemedText>
        <ThemedText style={styles.subtitle}>Affordable calls to Kenya</ThemedText>

        <View style={styles.loadingContainer}>
          <View style={styles.loadingDot} />
          <View style={[styles.loadingDot, styles.loadingDotDelay1]} />
          <View style={[styles.loadingDot, styles.loadingDotDelay2]} />
        </View>
      </BlurView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  decorativeBlur: { position: 'absolute', width: 300, height: 300, borderRadius: 200, opacity: 0.6 },
  logoCard: { borderRadius: 32, padding: 48, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  logoContainer: { marginBottom: 24 },
  title: { marginBottom: 8 },
  subtitle: { fontSize: 16, opacity: 0.6, marginBottom: 32 },
  loadingContainer: { flexDirection: 'row', gap: 8 },
  loadingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', opacity: 0.3 },
  loadingDotDelay1: { opacity: 0.6 },
  loadingDotDelay2: { opacity: 1 },
});
