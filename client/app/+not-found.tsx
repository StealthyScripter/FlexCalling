import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';

export default function NotFoundScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)' }]} />

      <BlurView intensity={isDark ? 30 : 70} tint={colorScheme} style={styles.contentCard}>
        <IconSymbol name="exclamationmark.triangle.fill" size={80} color="#EF4444" />
        <ThemedText type="title" style={styles.title}>404</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>Page Not Found</ThemedText>
        <ThemedText style={styles.description}>
          The page you&#39;re looking for doesn&#39;t exist.
        </ThemedText>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <IconSymbol name="house.fill" size={20} color="#fff" />
          <ThemedText style={styles.homeButtonText}>Go Home</ThemedText>
        </TouchableOpacity>
      </BlurView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  decorativeBlur: { position: 'absolute', width: 300, height: 300, borderRadius: 200, opacity: 0.6 },
  contentCard: { borderRadius: 32, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden', maxWidth: 400 },
  title: { marginTop: 24, marginBottom: 8 },
  subtitle: { marginBottom: 16 },
  description: { fontSize: 16, opacity: 0.6, textAlign: 'center', marginBottom: 32 },
  homeButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#10B981', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  homeButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});