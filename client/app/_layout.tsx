import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';

import { ThemeProvider as CustomThemeProvider } from '@/contexts/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CallProvider } from '@/contexts/call-context';
import { APIService } from '@/services/api.service';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);

  // Initialize storage on app startup
  useEffect(() => {
    async function initializeApp() {
      try {
        console.log('🚀 Initializing app with persistent storage...');
        await APIService.initialize();
        console.log('✅ App initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize app:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeApp();
  }, []);

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="(modals)"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
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
