import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ColorScheme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  colorScheme: 'light' | 'dark';
  themeSetting: ColorScheme;
  setThemeSetting: (scheme: ColorScheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@flexcalling_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const deviceColorScheme = useDeviceColorScheme();
  const [themeSetting, setThemeSettingState] = useState<ColorScheme>('auto');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme preference from storage on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        setThemeSettingState(savedTheme as ColorScheme);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setThemeSetting = async (scheme: ColorScheme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
      setThemeSettingState(scheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const currentScheme = themeSetting === 'auto'
      ? deviceColorScheme ?? 'light'
      : themeSetting;

    const newScheme = currentScheme === 'light' ? 'dark' : 'light';
    setThemeSetting(newScheme);
  };

  // Determine actual color scheme based on setting
  const colorScheme: 'light' | 'dark' =
    themeSetting === 'auto'
      ? (deviceColorScheme ?? 'light')
      : themeSetting;

  // Don't render children until theme is loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        colorScheme,
        themeSetting,
        setThemeSetting,
        toggleTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}