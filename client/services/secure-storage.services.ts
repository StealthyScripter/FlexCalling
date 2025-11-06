import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Only import SecureStore on native platforms
let SecureStore: any = null;
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  SecureStore = require('expo-secure-store');
}

/**
 * Platform-aware secure storage
 * - Uses SecureStore on iOS/Android (encrypted)
 * - Uses AsyncStorage on web (localStorage)
 */
class SecureStorageService {
  private isNative = Platform.OS === 'ios' || Platform.OS === 'android';

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isNative && SecureStore) {
        await SecureStore.setItemAsync(key, value);
      } else {
        // Fallback to AsyncStorage on web with @secure_ prefix
        await AsyncStorage.setItem(`@secure_${key}`, value);
      }
    } catch (error) {
      console.error(`Failed to set ${key}:`, error);
      throw error;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (this.isNative && SecureStore) {
        return await SecureStore.getItemAsync(key);
      } else {
        return await AsyncStorage.getItem(`@secure_${key}`);
      }
    } catch (error) {
      console.error(`Failed to get ${key}:`, error);
      return null;
    }
  }

  async deleteItem(key: string): Promise<void> {
    try {
      if (this.isNative && SecureStore) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(`@secure_${key}`);
      }
    } catch (error) {
      console.error(`Failed to delete ${key}:`, error);
      throw error;
    }
  }
}

export const secureStorage = new SecureStorageService();
