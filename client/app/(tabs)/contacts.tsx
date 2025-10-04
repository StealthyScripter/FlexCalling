import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ContactsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Contacts</ThemedText>
      <ThemedText>Your contacts will appear here</ThemedText>
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
