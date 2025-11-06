// client/app/(auth)/signup.tsx
import { StyleSheet, TextInput, TouchableOpacity, View, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { useState } from 'react';
import { AuthService } from '@/services/auth.services';
import { APIService } from '@/services/api.services';

export default function SignupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateInputs = (): string | null => {
    if (!name.trim()) {
      return 'Please enter your name';
    }

    if (!email.trim()) {
      return 'Please enter your email';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }

    if (!phone.trim()) {
      return 'Please enter your phone number';
    }

    // Basic phone validation (should start with + and have digits)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return 'Please enter a valid phone number (e.g., +1234567890)';
    }

    if (!password) {
      return 'Please enter a password';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }

    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }

    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }

    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }

    return null;
  };

  const handleSignup = async () => {
    // Validate inputs
    const validationError = validateInputs();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Register with backend
      const user = await AuthService.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
      });

      console.log('✅ Registration successful:', user.name);

      // Initialize API service with authenticated session
      await APIService.initialize();

      Alert.alert(
        'Success',
        `Welcome to FlexCalling, ${user.name}! Your account has been created.`,
        [
          {
            text: 'Get Started',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      console.error('❌ Registration failed:', error);

      let errorMessage = 'An error occurred. Please try again.';

      if (error instanceof Error) {
        // Handle specific error messages from backend
        if (error.message.includes('email already exists')) {
          errorMessage = 'This email is already registered. Please login instead.';
        } else if (error.message.includes('phone number already exists')) {
          errorMessage = 'This phone number is already registered. Please login instead.';
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

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
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
              value={name}
              onChangeText={setName}
              editable={!isLoading}
            />
          </BlurView>

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
            <IconSymbol name="phone.fill" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
            <TextInput
              style={styles.input}
              placeholder="Phone Number (e.g., +1234567890)"
              placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
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
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />
          </BlurView>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.inputCard}>
            <IconSymbol name="lock.fill" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
              secureTextEntry
              autoCapitalize="none"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!isLoading}
              onSubmitEditing={handleSignup}
            />
          </BlurView>

          {/* Password requirements */}
          <View style={styles.requirementsCard}>
            <ThemedText style={styles.requirementsTitle}>Password Requirements:</ThemedText>
            <ThemedText style={styles.requirementItem}>• At least 8 characters</ThemedText>
            <ThemedText style={styles.requirementItem}>• One uppercase letter</ThemedText>
            <ThemedText style={styles.requirementItem}>• One lowercase letter</ThemedText>
            <ThemedText style={styles.requirementItem}>• One number</ThemedText>
          </View>

          <TouchableOpacity
            style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.signupButtonText}>Create Account</ThemedText>
            )}
          </TouchableOpacity>

          <View style={styles.loginPrompt}>
            <ThemedText>Already have an account? </ThemedText>
            <TouchableOpacity onPress={handleLogin}>
              <ThemedText style={styles.loginLink}>Sign In</ThemedText>
            </TouchableOpacity>
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
  requirementsCard: { backgroundColor: 'rgba(139, 92, 246, 0.1)', padding: 12, borderRadius: 12 },
  requirementsTitle: { fontSize: 12, fontWeight: '600', marginBottom: 4, color: '#8B5CF6' },
  requirementItem: { fontSize: 11, opacity: 0.7, marginTop: 2 },
  signupButton: { backgroundColor: '#8B5CF6', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 8, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  signupButtonDisabled: { opacity: 0.6 },
  signupButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  loginPrompt: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginLink: { color: '#8B5CF6', fontWeight: '600' },
});
