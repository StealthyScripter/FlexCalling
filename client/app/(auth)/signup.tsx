import { StyleSheet, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';

export default function SignupScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, styles.blur1, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)' }]} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <BlurView intensity={isDark ? 30 : 70} tint={colorScheme} style={styles.logoCard}>
          <View style={styles.logo}>
            <IconSymbol name="person.badge.plus.fill" size={64} color="#8B5CF6" />
          </View>
          <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
          <ThemedText style={styles.subtitle}>Join FlexCalling today</ThemedText>
        </BlurView>

        <View style={styles.form}>
          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.inputCard}>
            <IconSymbol name="person.fill" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'} />
          </BlurView>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.inputCard}>
            <IconSymbol name="phone.fill" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
            <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'} keyboardType="phone-pad" />
          </BlurView>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.inputCard}>
            <IconSymbol name="envelope.fill" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'} keyboardType="email-address" />
          </BlurView>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.inputCard}>
            <IconSymbol name="lock.fill" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
            <TextInput style={styles.input} placeholder="Password" placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'} secureTextEntry />
          </BlurView>

          <TouchableOpacity style={styles.signupButton}>
            <ThemedText style={styles.signupButtonText}>Create Account</ThemedText>
          </TouchableOpacity>

          <View style={styles.loginPrompt}>
            <ThemedText>Already have an account? </ThemedText>
            <TouchableOpacity><ThemedText style={styles.loginLink}>Sign In</ThemedText></TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  decorativeBlur: { position: 'absolute', width: 280, height: 280, borderRadius: 200, top: -100, right: -80 },
  blur1: {},
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  logoCard: { borderRadius: 32, padding: 32, alignItems: 'center', marginBottom: 40, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  logo: { marginBottom: 16 },
  title: { marginBottom: 8 },
  subtitle: { fontSize: 16, opacity: 0.6 },
  form: { width: '100%', gap: 16 },
  inputCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  input: { flex: 1, fontSize: 16 },
  signupButton: { backgroundColor: '#8B5CF6', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 8, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  signupButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  loginPrompt: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginLink: { color: '#8B5CF6', fontWeight: '600' },
});
