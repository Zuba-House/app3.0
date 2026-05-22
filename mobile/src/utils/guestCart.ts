/**
 * Guest cart persistence (AsyncStorage) — keeps Redux and storage in sync.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import type { CartItem } from '../types/cart.types';

export async function persistGuestCart(items: CartItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
  } catch {
    // Non-blocking
  }
}

export async function loadGuestCartFromStorage(): Promise<CartItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CART);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function clearGuestCartStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.CART);
  } catch {
    // Non-blocking
  }
}
