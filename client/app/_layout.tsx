import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ThemeProvider as CustomThemeProvider } from '@/contexts/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CallProvider } from '@/contexts/call-context';

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Splash Screen */}
        <Stack.Screen name="index" />

        {/* Auth Flow */}
        <Stack.Screen name="(auth)" />

        {/* Main App Tabs */}
        <Stack.Screen name="(tabs)" />

        {/* Modal Screens Group */}
        <Stack.Screen
          name="(modals)"
          options={{
            presentation: 'modal',
            headerShown: false
          }}
        />

        {/* 404 Not Found */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <CustomThemeProvider>
      <CallProvider>
        <RootLayoutNav />
      </CallProvider>
    </CustomThemeProvider>
  );
}
