import { StyleSheet, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { useState } from 'react';
import { AuthService } from '@/services/auth.services';
import { APIService } from '@/services/api.services';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Validate input
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Login with backend
      const user = await AuthService.login({ email, password });

      console.log('✅ Login successful:', user.name);

      // Initialize API service with authenticated session
      await APIService.initialize();

      Alert.alert('Success', `Welcome back, ${user.name}!`, [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } catch (error) {
      console.error('❌ Login failed:', error);

      const errorMessage = error instanceof Error
        ? error.message
        : 'An error occurred. Please try again.';

      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      'Password reset functionality will be available soon. Please contact support.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, styles.blur1, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)' }]} />
      <View style={[styles.decorativeBlur, styles.blur2, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)' }]} />

      <View style={styles.content}>
        <BlurView intensity={isDark ? 30 : 70} tint={colorScheme} style={styles.logoCard}>
          <View style={styles.logo}>
            <IconSymbol name="phone.circle.fill" size={64} color="#10B981" />
          </View>
          <ThemedText type="title" style={styles.title}>Welcome Back</ThemedText>
          <ThemedText style={styles.subtitle}>Sign in to FlexCalling</ThemedText>
        </BlurView>

        <View style={styles.form}>
          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.inputCard}>
            <IconSymbol name="envelope.fill" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
            />
          </BlurView>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.inputCard}>
            <IconSymbol name="lock.fill" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
              onSubmitEditing={handleLogin}
            />
          </BlurView>

          {/* Development Helper */}
          <View style={styles.devHelper}>
            <ThemedText style={styles.devText}>
              Dev: james.doe@example.com / password123
            </ThemedText>
          </View>

          <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
            <ThemedText style={styles.forgotText}>Forgot Password?</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.loginButtonText}>Sign In</ThemedText>
            )}
          </TouchableOpacity>

          <View style={styles.signupPrompt}>
            <ThemedText>Don&#39;t have an account? </ThemedText>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <ThemedText style={styles.signupLink}>Sign Up</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  decorativeBlur: { position: 'absolute', borderRadius: 200 },
  blur1: { width: 300, height: 300, top: -100, right: -100 },
  blur2: { width: 250, height: 250, bottom: -80, left: -80 },
  content: { alignItems: 'center' },
  logoCard: { borderRadius: 32, padding: 32, alignItems: 'center', marginBottom: 40, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  logo: { marginBottom: 16 },
  title: { marginBottom: 8 },
  subtitle: { fontSize: 16, opacity: 0.6 },
  form: { width: '100%', gap: 16 },
  inputCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  input: { flex: 1, fontSize: 16 },
  devHelper: { backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 12, borderRadius: 12, alignItems: 'center' },
  devText: { fontSize: 12, color: '#3B82F6', fontWeight: '600' },
  forgotPassword: { alignSelf: 'flex-end' },
  forgotText: { color: '#10B981', fontSize: 14, fontWeight: '600' },
  loginButton: { backgroundColor: '#10B981', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 8, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  signupPrompt: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  signupLink: { color: '#10B981', fontWeight: '600' },
});
