import { useTheme } from '@/contexts/theme-context';

/**
 * Custom hook that returns the current color scheme.
 * This respects the user's theme preference from the theme context.
 */
export function useColorScheme() {
  const { colorScheme } = useTheme();
  return colorScheme;
}