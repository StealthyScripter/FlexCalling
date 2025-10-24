import { Router } from 'expo-router';

export const safeNavigateBack = (router: Router, fallbackRoute: string = '/(tabs)') => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallbackRoute as any);
  }
};