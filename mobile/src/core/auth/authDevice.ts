import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';

const DEVICE_ID_KEY = 'auth_device_id_v1';

let cachedDeviceId: string | null = null;

export async function getDeviceSessionId(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId;
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) {
    cachedDeviceId = existing;
    return existing;
  }
  const generated = randomUUID();
  await AsyncStorage.setItem(DEVICE_ID_KEY, generated);
  cachedDeviceId = generated;
  return generated;
}

export function clearDeviceSessionMemory(): void {
  cachedDeviceId = null;
}
