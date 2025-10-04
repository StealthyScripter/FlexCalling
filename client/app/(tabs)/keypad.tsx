import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function KeypadScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Keypad</ThemedText>
      <ThemedText>Dial pad interface coming soon</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
});
