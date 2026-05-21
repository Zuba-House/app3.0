import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'auth_device_id_v1';

function generateDeviceId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

let cachedDeviceId: string | null = null;

export async function getDeviceSessionId(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId;
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) {
    cachedDeviceId = existing;
    return existing;
  }
  const generated = generateDeviceId();
  await AsyncStorage.setItem(DEVICE_ID_KEY, generated);
  cachedDeviceId = generated;
  return generated;
}

export function clearDeviceSessionMemory(): void {
  cachedDeviceId = null;
}
