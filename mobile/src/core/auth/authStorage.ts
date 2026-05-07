import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../../constants/config';
import { UserDTO } from './authTypes';

export const authStorage = {
  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  },
  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token);
  },
  async clearRefreshToken(): Promise<void> {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  },
  async getUserCache(): Promise<UserDTO | null> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserDTO;
    } catch {
      return null;
    }
  },
  async setUserCache(user: UserDTO): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  async clearUserCache(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  },
  async clearAuthStorage(): Promise<void> {
    await this.clearRefreshToken();
    await this.clearUserCache();
    await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  },
};
