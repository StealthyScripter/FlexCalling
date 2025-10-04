import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LoginScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>Welcome Back</ThemedText>
        <ThemedText style={styles.subtitle}>Sign in to continue to FlexCalling</ThemedText>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <ThemedText style={styles.forgotText}>Forgot Password?</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton}>
            <ThemedText style={styles.loginButtonText}>Sign In</ThemedText>
          </TouchableOpacity>

          <View style={styles.signupPrompt}>
            <ThemedText>Don&#39;t have an account? </ThemedText>
            <TouchableOpacity>
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
  content: { alignItems: 'center' },
  title: { marginBottom: 8 },
  subtitle: { fontSize: 16, opacity: 0.6, marginBottom: 40 },
  form: { width: '100%', gap: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  forgotPassword: { alignSelf: 'flex-end' },
  forgotText: { color: '#007AFF', fontSize: 14 },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  signupPrompt: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  signupLink: { color: '#007AFF', fontWeight: '600' },
});
