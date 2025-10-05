import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, styles.blur1, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)' }]} />
      <View style={[styles.decorativeBlur, styles.blur2, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)' }]} />

      <View style={styles.content}>
        <BlurView intensity={isDark ? 30 : 70} tint={colorScheme} style={styles.heroCard}>
          <IconSymbol name="phone.circle.fill" size={100} color="#10B981" />
          <ThemedText type="title" style={styles.title}>Welcome to FlexCalling</ThemedText>
          <ThemedText style={styles.subtitle}>Make affordable calls from USA to Kenya</ThemedText>
        </BlurView>

        <View style={styles.features}>
          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.featureCard}>
            <IconSymbol name="dollarsign.circle.fill" size={32} color="#10B981" />
            <ThemedText type="defaultSemiBold">Low Rates</ThemedText>
            <ThemedText style={styles.featureText}>Just $0.05/min to Kenya</ThemedText>
          </BlurView>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.featureCard}>
            <IconSymbol name="phone.fill" size={32} color="#3B82F6" />
            <ThemedText type="defaultSemiBold">Crystal Clear</ThemedText>
            <ThemedText style={styles.featureText}>HD voice quality</ThemedText>
          </BlurView>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.featureCard}>
            <IconSymbol name="lock.fill" size={32} color="#8B5CF6" />
            <ThemedText type="defaultSemiBold">Secure</ThemedText>
            <ThemedText style={styles.featureText}>End-to-end encrypted</ThemedText>
          </BlurView>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => router.push('/(auth)/signup')}
          >
            <ThemedText style={styles.signupText}>Get Started</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <ThemedText style={styles.loginText}>I already have an account</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  decorativeBlur: { position: 'absolute', borderRadius: 200 },
  blur1: { width: 300, height: 300, top: -100, right: -100 },
  blur2: { width: 250, height: 250, bottom: -50, left: -80 },
  content: { gap: 32 },
  heroCard: { borderRadius: 32, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  title: { marginTop: 24, marginBottom: 8 },
  subtitle: { fontSize: 16, opacity: 0.6, textAlign: 'center' },
  features: { flexDirection: 'row', gap: 12 },
  featureCard: { flex: 1, borderRadius: 20, padding: 20, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  featureText: { fontSize: 12, opacity: 0.6, textAlign: 'center' },
  actions: { gap: 12 },
  signupButton: { backgroundColor: '#10B981', padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  signupText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  loginButton: { padding: 16, alignItems: 'center' },
  loginText: { color: '#10B981', fontSize: 16, fontWeight: '600' },
});