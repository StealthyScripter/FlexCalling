import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      balance: number;
      isVerified: boolean;
    };
    token: string;
  };
  error?: string;
}

export class AuthService {
  private static readonly TOKEN_KEY = 'authToken';
  private static readonly USER_ID_KEY = 'userId';
  private static readonly USER_DATA_KEY = '@flexcalling:user_data';

  /**
   * Register a new user
   */
  static async register(data: RegisterData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: AuthResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      // Store credentials securely
      await SecureStore.setItemAsync(this.TOKEN_KEY, result.data.token);
      await SecureStore.setItemAsync(this.USER_ID_KEY, result.data.user.id);
      await AsyncStorage.setItem(this.USER_DATA_KEY, JSON.stringify(result.data.user));

      console.log('✅ User registered successfully');
      return result.data.user;
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user with email and password
   */
  static async login(credentials: LoginCredentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result: AuthResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }

      // Store credentials securely
      await SecureStore.setItemAsync(this.TOKEN_KEY, result.data.token);
      await SecureStore.setItemAsync(this.USER_ID_KEY, result.data.user.id);
      await AsyncStorage.setItem(this.USER_DATA_KEY, JSON.stringify(result.data.user));

      console.log('✅ User logged in successfully');
      return result.data.user;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  static async logout() {
    try {
      await SecureStore.deleteItemAsync(this.TOKEN_KEY);
      await SecureStore.deleteItemAsync(this.USER_ID_KEY);
      await AsyncStorage.removeItem(this.USER_DATA_KEY);
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  }

  /**
   * Get stored auth token
   */
  static async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Get stored user ID
   */
  static async getUserId(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.USER_ID_KEY);
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }

  /**
   * Get current user data from storage
   */
  static async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem(this.USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getToken();
      return !!token;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current user profile from backend
   */
  static async getProfile() {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch profile');
      }

      // Update stored user data
      await AsyncStorage.setItem(this.USER_DATA_KEY, JSON.stringify(result.data));

      return result.data;
    } catch (error) {
      console.error('❌ Get profile error:', error);
      throw error;
    }
  }

  /**
   * Clear all auth data (for logout or error recovery)
   */
  static async clearAuthData() {
    try {
      await SecureStore.deleteItemAsync(this.TOKEN_KEY);
      await SecureStore.deleteItemAsync(this.USER_ID_KEY);
      await AsyncStorage.removeItem(this.USER_DATA_KEY);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }
}

export default AuthService;