import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { PropsWithChildren } from 'react';

export function ScreenContainer({ children }: PropsWithChildren) {
  return (
    <ThemedView style={styles.container}>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});