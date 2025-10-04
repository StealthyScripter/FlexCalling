// components/screen-container.tsx (UPDATED - Fix for TypeScript error)
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { PropsWithChildren } from 'react';
import { useThemeColor } from '@/hooks/use-theme-color';

export function ScreenContainer({ children }: PropsWithChildren) {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: String(backgroundColor) }]} edges={['top', 'left', 'right']}>
      <ThemedView style={styles.container}>
        {children}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
});
export const EnhancedColors = {
  light: {
    primary: '#10B981', // Green for call buttons
    background: '#F3F4F6',
    cardBackground: 'rgba(255, 255, 255, 0.7)',
    text: '#111827',
    textSecondary: '#6B7280',
    border: 'rgba(0, 0, 0, 0.05)',
    avatarColors: ['#EC4899', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'],
    incoming: '#3B82F6',
    outgoing: '#10B981',
    missed: '#EF4444',
    decorativeBlur1: 'rgba(59, 130, 246, 0.1)',
    decorativeBlur2: 'rgba(16, 185, 129, 0.1)',
  },
  dark: {
    primary: '#10B981',
    background: '#0F172A',
    cardBackground: 'rgba(30, 41, 59, 0.7)',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    border: 'rgba(255, 255, 255, 0.05)',
    avatarColors: ['#EC4899', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'],
    incoming: '#3B82F6',
    outgoing: '#10B981',
    missed: '#EF4444',
    decorativeBlur1: 'rgba(59, 130, 246, 0.15)',
    decorativeBlur2: 'rgba(16, 185, 129, 0.15)',
  },
};
