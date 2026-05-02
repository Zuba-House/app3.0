/**
 * Store JWTs in SecureStore (preferred) with one-time migration from AsyncStorage.
 */
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

export async function getAccessToken(): Promise<string | null> {
  try {
    const secure = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    if (secure) return secure;
  } catch {
    // fall through
  }
  const legacy = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (legacy) {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, legacy);
      await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch {
      // keep legacy in AsyncStorage if SecureStore fails
    }
    return legacy;
  }
  return null;
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    const secure = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    if (secure) return secure;
  } catch {
    // fall through
  }
  const legacy = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  if (legacy) {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, legacy);
      await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch {
      // keep legacy
    }
    return legacy;
  }
  return null;
}

export async function setAuthTokens(accessToken: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  if (refreshToken) {
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }
  await AsyncStorage.multiRemove([STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.REFRESH_TOKEN]);
}

export async function clearAuthTokens(): Promise<void> {
  await AsyncStorage.multiRemove([STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.REFRESH_TOKEN]);
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  } catch {
    // ignore
  }
}
