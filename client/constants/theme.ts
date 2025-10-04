/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
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

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
