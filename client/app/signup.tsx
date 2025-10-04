import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SignupScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
        <ThemedText style={styles.subtitle}>Sign up to start calling Kenya</ThemedText>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
          />

          <TouchableOpacity style={styles.signupButton}>
            <ThemedText style={styles.signupButtonText}>Create Account</ThemedText>
          </TouchableOpacity>

          <View style={styles.loginPrompt}>
            <ThemedText>Already have an account? </ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.loginLink}>Sign In</ThemedText>
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
  signupButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  signupButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  loginPrompt: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginLink: { color: '#007AFF', fontWeight: '600' },
});
