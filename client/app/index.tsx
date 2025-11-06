// client/app/index.tsx
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { useCall } from '@/contexts/call-context';
import { AuthService } from '@/services/auth.services';
import { APIService } from '@/services/api.services';

export default function SplashScreen() {
  const router = useRouter();
  const { registerDevice } = useCall();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('🚀 Initializing FlexCalling...');

        // Check if user is authenticated
        const isAuthenticated = await AuthService.isAuthenticated();

        if (isAuthenticated) {
          console.log('✅ User is authenticated');

          try {
            // Initialize API service (syncs with backend)
            await APIService.initialize();

            // Get access token for Twilio
            const token = await APIService.getAccessToken();
            console.log('📞 Registering Twilio device...');
            await registerDevice(token);
            console.log('✅ Twilio device registered');

            // Navigate to main app
            router.replace('/(tabs)');
          } catch (error) {
            console.error('❌ Initialization error:', error);

            // If initialization fails, might be due to expired token
            // Clear auth and redirect to login
            await AuthService.clearAuthData();
            router.replace('/(auth)/onboarding');
          }
        } else {
          console.log('ℹ️ User not authenticated, showing onboarding');
          router.replace('/(auth)/onboarding');
        }
      } catch (error) {
        console.error('❌ Failed to initialize app:', error);
        // On error, go to onboarding
        router.replace('/(auth)/onboarding');
      }
    };

    // Add a small delay to show splash screen
    const timer = setTimeout(initialize, 1500);
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

        <ThemedText style={styles.loadingText}>Initializing...</ThemedText>
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
  loadingContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  loadingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', opacity: 0.3 },
  loadingDotDelay1: { opacity: 0.6 },
  loadingDotDelay2: { opacity: 1 },
  loadingText: { fontSize: 14, opacity: 0.5 },
});
